import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-8xl font-heading font-bold text-primary/20">404</h1>
      <h2 className="text-2xl font-heading font-bold mt-4 mb-2">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" /> Go Back</Link>
        </Button>
        <Button asChild className="bg-primary text-primary-foreground rounded-xl">
          <Link to="/"><Home className="w-4 h-4 mr-2" /> Home</Link>
        </Button>
      </div>
    </div>
  );
}
