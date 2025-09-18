import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Step } from '../types/index';
import { 
  CheckCircle, 
  Circle,
  Target,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepsPanelProps {
  steps: Step[];
}

export default function StepsPanel({ steps }: StepsPanelProps) {
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="h-full bg-muted/30 border-l flex flex-col">
      {/* Header */}
      <div className="h-10 bg-muted/50 border-b flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          <span className="text-sm font-medium">Project Guide</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {completedSteps}/{totalSteps}
        </Badge>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Progress */}
        <div className="p-4 border-b">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 border-b">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Development Guide
              </CardTitle>
              <CardDescription className="text-xs">
                Follow these steps to build your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Completed steps are marked with a green tick.
              </p>
            </CardContent>
          </Card>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {steps.map((step, index) => (
              <Card 
                key={`${step.id}-${index}`} 
                className={cn(
                  "transition-colors", // Keep some transition for consistency with status change
                  step.status === "completed" && "bg-primary/5 border-primary/20"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {step.status === "completed" ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className={cn(
                        "text-sm font-medium",
                        step.status === "completed" && "text-primary"
                      )}>
                        {index + 1}. {step.title}
                      </h4>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}