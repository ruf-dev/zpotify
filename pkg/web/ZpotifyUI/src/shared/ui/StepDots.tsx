import cn from "classnames";
import cls from "@/shared/ui/StepDots.module.css";

interface StepDotsProps<T> {
    steps: T[];
    currentStep: T;
}

export default function StepDots<T>({ steps, currentStep }: StepDotsProps<T>) {
    const activeIndex = steps.indexOf(currentStep);
    return (
        <div className={cls.StepDotsContainer}>
            {steps.map((s, i) => (
                <span
                    key={String(s)}
                    className={cn({
                        [cls.DotActive]: i === activeIndex,
                        [cls.DotPast]: i < activeIndex,
                        [cls.DotFuture]: i > activeIndex,
                    })}
                />
            ))}
        </div>
    );
}
