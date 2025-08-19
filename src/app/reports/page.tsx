import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col items-center gap-4 p-4 md:gap-6 md:p-6">
        <div className="w-full max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Informes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                La sección de informes está en construcción. ¡Vuelve pronto!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
