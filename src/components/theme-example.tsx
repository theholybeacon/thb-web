import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function ThemeExample() {
  return (
    <div className="container py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading">The Holy Beacon Typography</h1>
        <p className="text-lg">This is body text in Roboto font</p>
        <h2 className="text-3xl font-heading">This is a heading in Oswald font</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Primary Colors</CardTitle>
            <CardDescription>Custom theme colors for The Holy Beacon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded bg-holyBlack"></div>
              <div>
                <p className="font-bold">Holy Black</p>
                <p className="text-sm text-muted-foreground">#0F2033</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded bg-holyWhite"></div>
              <div>
                <p className="font-bold">Holy White</p>
                <p className="text-sm text-muted-foreground">#B7B795</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="bg-holyBlack text-holyWhite hover:bg-holyBlack/90">Holy Black Button</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme Components</CardTitle>
            <CardDescription>shadcn/ui components with custom theme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-muted-foreground">Muted background with muted text</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="border-holyWhite text-holyBlack">
              Custom Outline
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

