"use client";

import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { BarChart4, Calendar, Download, Filter } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Define colors for the pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// Product type distribution will be passed as props

export default function AnalyticsClient({
  totalCollected,
  totalDistributed,
  balance,
  monthlyData,
  productDistribution,
}: {
  totalCollected: number;
  totalDistributed: number;
  balance: number;
  monthlyData: any[];
  productDistribution: { name: string; value: number; color: string }[];
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">
                View zakat collection and distribution analytics
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar size={16} />
                This Month
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Export
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Collected */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start mb-6">
                <span className="text-muted-foreground">Total Collected</span>
                <div className="bg-green-100 p-1 rounded-md">
                  <BarChart4 className="text-green-600" size={18} />
                </div>
              </div>
              <div className="text-3xl font-bold">
                {totalCollected.toFixed(2)} ETB
              </div>
              <span className="text-sm text-muted-foreground mt-1">
                From all sources
              </span>
            </div>

            {/* Total Distributed */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start mb-6">
                <span className="text-muted-foreground">Total Distributed</span>
                <div className="bg-blue-100 p-1 rounded-md">
                  <BarChart4 className="text-primary" size={18} />
                </div>
              </div>
              <div className="text-3xl font-bold">
                {totalDistributed.toFixed(2)} ETB
              </div>
              <span className="text-sm text-muted-foreground mt-1">
                To all beneficiaries
              </span>
            </div>

            {/* Current Balance */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start mb-6">
                <span className="text-muted-foreground">Current Balance</span>
                <div className="bg-purple-100 p-1 rounded-md">
                  <BarChart4 className="text-purple-600" size={18} />
                </div>
              </div>
              <div className="text-3xl font-bold">{balance.toFixed(2)} ETB</div>
              <span
                className={`text-sm ${balance < 0 ? "text-red-500 font-medium" : "text-muted-foreground"} mt-1`}
              >
                {balance < 0
                  ? "Deficit - More distributed than collected"
                  : "Available for distribution"}
              </span>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-lg border p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                Collection & Distribution Trends
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Filter size={14} />
                Filter
              </Button>
            </div>
            <div className="h-80 border rounded-lg bg-gray-50 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="collections"
                    stroke="#00C49F"
                    activeDot={{ r: 8 }}
                    name="Collections"
                  />
                  <Line
                    type="monotone"
                    dataKey="distributions"
                    stroke="#0088FE"
                    name="Distributions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution by Category */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">
              Distribution by Beneficiary Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 border rounded-lg bg-gray-50 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {productDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {productDistribution.map((category, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span>{category.name}</span>
                    </div>
                    <span className="font-medium">{category.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
