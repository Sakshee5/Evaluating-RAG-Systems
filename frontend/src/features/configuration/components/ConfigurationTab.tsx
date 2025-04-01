import { Button } from "@/components/ui/button"
import { Configuration } from "@/models/configuration"
import { ConfigurationForm } from "./ConfigurationForm"
import { ConfigurationList } from "./ConfigurationList"

interface ConfigurationTabProps {
  currentConfiguration: Configuration;
  configurations: Configuration[];
  onConfigurationChange: (config: Configuration) => void;
  onSubmit: () => void;
  onDelete: (id: string) => void;
  onEvaluate: () => void;
}

export const ConfigurationTab = ({
  currentConfiguration,
  configurations,
  onConfigurationChange,
  onSubmit,
  onDelete,
  onEvaluate,
}: ConfigurationTabProps) => {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Configuration</h2>
          <ConfigurationForm 
            configuration={currentConfiguration}
            onConfigurationChange={onConfigurationChange}
            onSubmit={onSubmit}
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Saved Configurations</h2>
          <ConfigurationList 
            configurations={configurations}
            onDelete={onDelete}
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button 
          onClick={onEvaluate}
          disabled={configurations.length === 0}
        >
          Proceed to Evaluation
        </Button>
      </div>
    </div>
  );
}; 