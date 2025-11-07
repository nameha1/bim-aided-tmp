import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Briefcase, Clock, Calendar } from "lucide-react";

interface JobDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  onApply: () => void;
}

const JobDetailsDialog = ({ isOpen, onClose, job, onApply }: JobDetailsDialogProps) => {
  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl">{job.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Job Meta Information */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-primary" />
              <span>{job.departments?.name || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <span>{job.employment_type}</span>
            </div>
            {job.posted_date && (
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                <span>Posted {new Date(job.posted_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Job Description */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Job Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {job.description || "No description available."}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <>
              <Separator />
              <div>
                <h3 className="text-xl font-semibold mb-3">Requirements</h3>
                <p className="text-muted-foreground whitespace-pre-line">{job.requirements}</p>
              </div>
            </>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <>
              <Separator />
              <div>
                <h3 className="text-xl font-semibold mb-3">Responsibilities</h3>
                <p className="text-muted-foreground whitespace-pre-line">{job.responsibilities}</p>
              </div>
            </>
          )}

          {/* Salary Range */}
          {job.salary_range && (
            <>
              <Separator />
              <div>
                <h3 className="text-xl font-semibold mb-3">Salary Range</h3>
                <p className="text-muted-foreground">{job.salary_range}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
            <Button onClick={onApply} className="flex-1">
              Apply for this Position
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsDialog;
