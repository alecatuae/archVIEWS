import React, { useState, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/router';

const environments = [
  { id: 'all', name: 'Todos os ambientes' },
  { id: 'prod', name: 'Produção' },
  { id: 'stage', name: 'Staging' },
  { id: 'dev', name: 'Desenvolvimento' },
];

const EnvironmentSelector: React.FC = () => {
  const router = useRouter();
  const [selected, setSelected] = useState(environments[0]);

  useEffect(() => {
    // Obter ambiente da query string ou localStorage
    const envFromQuery = router.query.env as string;
    const envFromStorage = typeof window !== 'undefined' 
      ? localStorage.getItem('selectedEnvironment') 
      : null;
    
    const selectedEnvId = envFromQuery || envFromStorage || 'all';
    const selectedEnv = environments.find(env => env.id === selectedEnvId) || environments[0];
    
    setSelected(selectedEnv);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedEnvironment', selectedEnv.id);
    }
  }, [router.query.env]);

  const handleEnvironmentChange = (value: typeof selected) => {
    setSelected(value);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedEnvironment', value.id);
    }
    
    // Atualizar a URL com o ambiente selecionado
    const query = { ...router.query, env: value.id };
    if (value.id === 'all') {
      delete query.env;
    }
    
    router.push({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
  };

  return (
    <Listbox value={selected} onChange={handleEnvironmentChange}>
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-computing-purple focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-computing-purple sm:text-sm">
          <span className="block truncate">{selected.name}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={React.Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
            {environments.map((environment) => (
              <Listbox.Option
                key={environment.id}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-computing-purple text-white' : 'text-gray-900'
                  }`
                }
                value={environment}
              >
                {({ selected, active }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {environment.name}
                    </span>
                    {selected ? (
                      <span
                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                          active ? 'text-white' : 'text-computing-purple'
                        }`}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default EnvironmentSelector; 