import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const topContributors = [
  { name: 'Alice Johnson', commits: 156, avatar: '/avatars/alice-johnson.png', initials: 'AJ' },
  { name: 'Bob Smith', commits: 129, avatar: '/avatars/bob-smith.png', initials: 'BS' },
  { name: 'Charlie Brown', commits: 115, avatar: '/avatars/charlie-brown.png', initials: 'CB' },
  { name: 'Diana Ross', commits: 98, avatar: '/avatars/diana-ross.png', initials: 'DR' },
  { name: 'Edward Norton', commits: 87, avatar: '/avatars/edward-norton.png', initials: 'EN' },
]

export function ContributorList() {
  return (
    <div className="space-y-8">
      {topContributors.map((contributor, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={contributor.avatar} alt={contributor.name} />
            <AvatarFallback>{contributor.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{contributor.name}</p>
            <p className="text-sm text-muted-foreground">{contributor.commits} commits</p>
          </div>
        </div>
      ))}
    </div>
  )
}