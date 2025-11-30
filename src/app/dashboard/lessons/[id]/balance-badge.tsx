import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface BalanceBadgeProps {
    balance: number
    currency?: string
    className?: string;
}


export default function BalanceBadge({ balance, currency = '', className }: BalanceBadgeProps) {


    const [isRevealed, setIsRevealed] = useState(false)


    return <Badge variant={'success'} className="group cursor-pointer w-14 h-6 text-center" role="button" onClick={() => setIsRevealed(!isRevealed)}>
        {isRevealed ? <span className="inline group-hover:hidden text-xs">{balance.toLocaleString('ru-RU')} ₽</span> : <span className="inline group-hover:hidden text-lg">⁎⁎⁎</span>}
        {isRevealed ? <EyeOff className="group-hover:inline hidden" /> : <Eye className="group-hover:inline hidden" />}

    </Badge>


}