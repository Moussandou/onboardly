import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "bg-white rounded-xl border border-gray-200 shadow-sm",
                className
            )}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }: CardProps) {
    return (
        <div
            className={cn("px-6 py-5 border-b border-gray-100", className)}
            {...props}
        />
    );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn("font-semibold text-gray-900 leading-none tracking-tight", className)}
            {...props}
        />
    );
}

export function CardContent({ className, ...props }: CardProps) {
    return (
        <div className={cn("p-6", className)} {...props} />
    );
}
