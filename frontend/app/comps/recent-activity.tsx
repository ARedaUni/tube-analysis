import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const recentActivities = [
  {
    user: { name: 'John Doe', avatar: '/avatars/john-doe.png', initials: 'JD' },
    action: 'opened a pull request',
    target: 'Fix navigation bug',
    time: '2 hours ago'
  },
  {
    user: { name: 'Jane Smith', avatar: '/avatars/jane-smith.png', initials: 'JS' },
    action: 'commented on issue',
    target: 'Update documentation',
    time: '4 hours ago'
  },
  {
    user: { name: 'Bob Johnson', avatar: '/avatars/bob-johnson.png', initials: 'BJ' },
    action: 'merged pull request',
    target: 'Add new feature',
    time: '1 day ago'
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {recentActivities.map((activity, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.user.name} {activity.action}
            </p>
            <p className="text-sm text-muted-foreground">
              {activity.target}
            </p>
          </div>
          <div className="ml-auto font-medium text-sm text-muted-foreground">
            {activity.time}
          </div>
        </div>
      ))}
    </div>
  )
}