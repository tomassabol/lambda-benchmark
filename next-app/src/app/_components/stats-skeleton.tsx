import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"

export function ChartSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-screen-lg flex-col gap-4 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="border-none shadow-md">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <CardDescription className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-64" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
