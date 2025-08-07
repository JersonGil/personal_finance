import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

interface Transaction {
  date: string
  type: "income" | "expense"
  amount: number
  category: string
}

interface ExpensesByCategoryChartProps {
  transactions: Transaction[]
}

export default function ExpensesByCategoryChart({ transactions }: ExpensesByCategoryChartProps) {
  const expensesByCategory = useMemo(() => {
    const categoryTotals = transactions
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount,
    }))
  }, [transactions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={expensesByCategory}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {expensesByCategory.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`$${value}`, "Monto"]} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}