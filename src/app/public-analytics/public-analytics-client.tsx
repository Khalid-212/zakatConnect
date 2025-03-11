"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Download, Filter } from "lucide-react";
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
  BarChart,
  Bar,
} from "recharts";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function PublicAnalyticsClient(props: {
  totalCollected: number;
  totalDistributed: number;
  balance: number;
  monthlyData: any[];
  mosqueDistribution: { name: string; value: number; color: string }[];
  beneficiariesCount: number;
  giversCount: number;
  mosques: { id: string; name: string }[];
}) {
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(
    "all",
  );

  // Filter data based on selected mosque
  // Filter monthly data based on selected mosque
  const filteredMonthlyData = props.monthlyData;

  // If a specific mosque is selected, we need to modify the data
  if (selectedMosqueId && selectedMosqueId !== "all") {
    // Create a deep copy of the data to avoid modifying the original
    const filteredData = JSON.parse(JSON.stringify(props.monthlyData));

    // For each day, replace the collections and distributions values with mosque-specific values
    filteredData.forEach((day) => {
      // Replace collections with mosque-specific collections
      if (day[`mosque_${selectedMosqueId}`]) {
        day.collections = day[`mosque_${selectedMosqueId}`];
      } else {
        day.collections = 0;
      }

      // Replace distributions with mosque-specific distributions
      if (day[`mosque_dist_${selectedMosqueId}`]) {
        day.distributions = day[`mosque_dist_${selectedMosqueId}`];
      } else {
        day.distributions = 0;
      }
    });

    return filteredData;
  }

  return props.monthlyData;

  const filteredMosqueDistribution =
    selectedMosqueId && selectedMosqueId !== "all"
      ? props.mosqueDistribution.filter((item) => item.id === selectedMosqueId)
      : props.mosqueDistribution;

  // Calculate filtered totals
  const filteredTotalCollected =
    selectedMosqueId && selectedMosqueId !== "all"
      ? props.totalCollectedByMosque?.[selectedMosqueId] || 0
      : props.totalCollected;

  const filteredTotalDistributed =
    selectedMosqueId && selectedMosqueId !== "all"
      ? props.totalDistributedByMosque?.[selectedMosqueId] || 0
      : props.totalDistributed;

  const filteredBalance = filteredTotalCollected - filteredTotalDistributed;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Public Zakat Analytics</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent insights into zakat collection and distribution across
              all mosques
            </p>
          </div>

          {/* Mosque Filter */}
          <div className="bg-white rounded-lg border p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="w-full md:w-64">
                <label className="block text-sm font-medium mb-2">
                  Filter by Mosque
                </label>
                <Select onValueChange={(value) => setSelectedMosqueId(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Mosques" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mosques</SelectItem>
                    {props.mosques.map((mosque) => (
                      <SelectItem key={mosque.id} value={mosque.id}>
                        {mosque.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Collected */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex justify-between items-start mb-6">
                <span className="text-muted-foreground">Total Collected</span>
                <div className="bg-green-100 p-1 rounded-md">
                  <div className="text-green-600 font-bold">ETB</div>
                </div>
              </div>
              <div className="text-3xl font-bold">
                {filteredTotalCollected.toFixed(2)} ETB
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
                  <div className="text-primary font-bold">ETB</div>
                </div>
              </div>
              <div className="text-3xl font-bold">
                {filteredTotalDistributed.toFixed(2)} ETB
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
                  <div className="text-purple-600 font-bold">ETB</div>
                </div>
              </div>
              <div className="text-3xl font-bold">
                {filteredBalance.toFixed(2)} ETB
              </div>
              <span
                className={`text-sm ${filteredBalance < 0 ? "text-red-500 font-medium" : "text-muted-foreground"} mt-1`}
              >
                {filteredBalance < 0
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
                  data={filteredMonthlyData}
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

          {/* Beneficiaries and Givers Chart */}
          <div className="bg-white rounded-lg border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">
              Beneficiaries and Givers
            </h2>
            <div className="h-80 border rounded-lg bg-gray-50 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Total",
                      beneficiaries: props.beneficiariesCount,
                      givers: props.giversCount,
                    },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="beneficiaries"
                    name="Beneficiaries"
                    fill="#8884d8"
                  />
                  <Bar dataKey="givers" name="Givers" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution by Mosque */}
          <div className="bg-white rounded-lg border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">
              Distribution by Mosque
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 border rounded-lg bg-gray-50 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredMosqueDistribution}
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
                      {filteredMosqueDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {filteredMosqueDistribution.map((mosque, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: mosque.color }}
                      ></div>
                      <span>{mosque.name}</span>
                    </div>
                    <span className="font-medium">{mosque.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-primary text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Join the ZakatConnect Community
            </h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Register your mosque today and be part of our transparent zakat
              management system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button variant="secondary" size="lg">
                  Register Your Mosque
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-primary/20 text-white border-white hover:bg-primary/30"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
