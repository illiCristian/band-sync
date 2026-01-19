"use client";

import { useEffect, useState } from "react";

interface FormattedDateProps {
    date: string | Date;
    className?: string;
}

export default function FormattedDate({ date, className }: FormattedDateProps) {
    const [formatted, setFormatted] = useState<string>("");

    useEffect(() => {
        setFormatted(new Date(date).toLocaleDateString());
    }, [date]);

    if (!formatted) {
        return <span className={className}>...</span>;
    }

    return <span className={className}>{formatted}</span>;
}
