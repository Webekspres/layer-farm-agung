import { Construction } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

type ComingSoonPanelProps = {
  message?: string;
};

export function ComingSoonPanel({
  message = "Modul ini akan diintegrasikan pada domain berikutnya.",
}: ComingSoonPanelProps) {
  return (
    <div className="flex w-full justify-center pt-2 sm:pt-4 md:pt-6">
      <Card className="w-full max-w-lg border-border/80 border-dashed shadow-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Construction className="size-6" />
          </div>
          <CardDescription className="text-base text-muted-foreground">
            Segera hadir
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          {message}
        </CardContent>
      </Card>
    </div>
  );
}
