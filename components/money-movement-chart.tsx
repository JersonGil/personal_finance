import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

const chartConfig = {
  desktop: {
    label: "ingresos",
    color: "#10b981",
  },
  mobile: {
    label: "gastos",
    color: "#ef4444",
  },
} satisfies ChartConfig

interface Transaction {
  date: string
  type: "income" | "expense"
  amount: number
  category: string
}

interface MoneyMovementChartProps {
  transactions: Transaction[]
}

export default function MoneyMovementChart({ transactions }: MoneyMovementChartProps) {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      // Create date in local timezone to avoid timezone offset issues
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      // Use local date string to match transaction dates
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })

    return last7Days.map((date) => {
      const dayTransactions = transactions.filter((t) => t.date === date)
      const income = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
      const expenses = dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

      return {
        date: new Date(date + 'T00:00:00').toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
        ingresos: income,
        gastos: expenses,
        balance: income - expenses,
      }
    })
  }, [transactions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimiento de Dinero (Últimos 7 días)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full h-full">
          <LineChart accessibilityLayer data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, ""]} />
            <Line type="monotone" dataKey="ingresos" stroke="var(--color-desktop)" strokeWidth={4} />
            <Line type="monotone" dataKey="gastos" stroke="var(--color-mobile)" strokeWidth={4} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}