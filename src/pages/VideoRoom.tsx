import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Video, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VideoRoom() {
  const [searchParams] = useSearchParams();
  const meetLink = searchParams.get("link");
  const [appointmentId] = useState(() => searchParams.get("id"));

  useEffect(() => {
    // Auto-redirect to Google Meet if link provided
    if (meetLink) {
      window.open(meetLink, "_blank");
    }
  }, [meetLink]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
        <Video className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-3xl font-heading font-bold mb-3">Video Consultation</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        {meetLink
          ? "Your Google Meet session should open in a new tab. If it didn't, click below."
          : "No meeting link available. The link will be generated once your appointment is approved."}
      </p>
      {meetLink && (
        <Button asChild size="lg" className="bg-primary text-primary-foreground rounded-xl px-8">
          <a href={meetLink} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" /> Open Google Meet
          </a>
        </Button>
      )}
    </div>
  );
}
