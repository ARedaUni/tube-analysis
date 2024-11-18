'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useQuery } from '@tanstack/react-query';
import { fetchRepositoryNames } from '@/services/api';
import { useRepository } from '@/hooks/useRepository';

export default function RepositorySelector() {
  const [open, setOpen] = useState(false);
  const { repository, setCurrentRepository } = useRepository();

  // Fetch repository names
  const { data: repositories = [], isLoading } = useQuery({
    queryKey: ['repositoryNames'],
    queryFn: fetchRepositoryNames,
    initialData: [],
  });

  const handleSelect = async (repoName: string) => {
    await setCurrentRepository(repoName);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between"
          disabled={isLoading}
        >
          {repository?.name || (isLoading ? 'Loading...' : 'Select repository...')}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search repository..." />
          <CommandList>
            <CommandEmpty>No repository found.</CommandEmpty>
            <CommandGroup heading="Repositories">
              {Array.isArray(repositories) && repositories.length > 0 ? (
                repositories.map((repoName) => (
                  <CommandItem
                    key={repoName}
                    value={repoName}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        repository?.name === repoName ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {repoName}
                  </CommandItem>
                ))
              ) : (
                <CommandEmpty>No repositories available.</CommandEmpty>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
