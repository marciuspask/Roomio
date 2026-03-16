const StepProgress = ({ steps, currentStep }: { steps: string[]; currentStep: number }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              i <= currentStep
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            <span className={`hidden text-sm font-medium sm:inline ${
              i <= currentStep ? "text-foreground" : "text-muted-foreground"
            }`}>
              {step}
            </span>
            {i < steps.length - 1 && (
              <div className={`mx-2 hidden h-0.5 w-8 sm:block ${
                i < currentStep ? "bg-primary" : "bg-border"
              }`} />
            )}
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-1 w-full rounded-full bg-muted">
        <div
          className="h-1 rounded-full bg-primary transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
export default StepProgress;
