'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useQuery } from '@tanstack/react-query'
import { fetchRepositoryNames } from '@/services/api'

export default function RepositorySelector() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  const { data: repositories = [], isLoading } = useQuery({
    queryKey: ['repositoryNames'],
    queryFn: fetchRepositoryNames,
    initialData: [],
  })

  // const { data: selectedRepository, refetch: refetchRepository } = useQuery({
  //   queryKey: ['repository', value],
  //   queryFn: () => fetchRepositoryByName(value),
  //   enabled: !!value,
  // })

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
          {value || (isLoading ? 'Loading...' : 'Select repository...')}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search repository..." />
          <CommandEmpty>No repository found.</CommandEmpty>
          <CommandGroup>
            {Array.isArray(repositories) && repositories.map((repository) => (
              <CommandItem
                key={repository}
                value={repository}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? '' : currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === repository ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {repository}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


