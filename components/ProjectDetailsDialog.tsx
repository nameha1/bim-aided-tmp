import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Building2, User } from "lucide-react";

interface Project {
  id?: string;
  title: string;
  category: string;
  description: string;
  image: string;
  client_name?: string | null;
  completion_date?: string | null;
  project_value?: number | null;
  location?: string | null;
  scope?: string | null;
  challenges?: string | null;
  solutions?: string | null;
  technologies?: string[] | null;
}

interface ProjectDetailsDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectDetailsDialog = ({ project, open, onOpenChange }: ProjectDetailsDialogProps) => {
  if (!project) return null;

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-4 right-4">
              {project.category}
            </Badge>
          </div>
          <DialogTitle className="text-3xl">{project.title}</DialogTitle>
          <DialogDescription className="text-base">
            {project.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Project Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {project.client_name && (
              <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                <User className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="font-semibold text-sm">{project.client_name}</p>
                </div>
              </div>
            )}

            {project.completion_date && (
              <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="font-semibold text-sm">{formatDate(project.completion_date)}</p>
                </div>
              </div>
            )}

            {project.project_value && (
              <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Project Value</p>
                  <p className="font-semibold text-sm">{formatCurrency(project.project_value)}</p>
                </div>
              </div>
            )}

            {project.location && (
              <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                <Building2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-semibold text-sm">{project.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Project Scope */}
          {project.scope && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Project Scope</h3>
              <p className="text-muted-foreground">{project.scope}</p>
            </div>
          )}

          {/* Challenges */}
          {project.challenges && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Challenges</h3>
              <p className="text-muted-foreground">{project.challenges}</p>
            </div>
          )}

          {/* Solutions */}
          {project.solutions && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Our Solutions</h3>
              <p className="text-muted-foreground">{project.solutions}</p>
            </div>
          )}

          {/* Technologies Used */}
          {project.technologies && project.technologies.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Technologies & Tools</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <Badge key={index} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsDialog;
