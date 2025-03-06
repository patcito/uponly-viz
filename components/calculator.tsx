import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Share2 } from "lucide-react";
import { motion } from "framer-motion";

// TypeScript version of the compound trading calculator
const compoundTradesCalculator = (
  startingCapital: number,
  profitPerTrade: number,
  numTrades: number,
  currentTrade: number = 1,
  currentCapital: number = startingCapital
): {
  final: number;
  history: Array<{ trade: number; capital: number; profit: number }>;
} => {
  const history: Array<{ trade: number; capital: number; profit: number }> = [];

  const calculate = (
    capital: number,
    rate: number,
    trades: number,
    iteration: number,
    current: number
  ): number => {
    if (trades === 0) {
      return current;
    }

    const profitAmount = current * (rate / 100);
    const newCapital = current + profitAmount;

    history.push({
      trade: iteration,
      capital: newCapital,
      profit: profitAmount,
    });

    return calculate(capital, rate, trades - 1, iteration + 1, newCapital);
  };

  const finalAmount = calculate(
    startingCapital,
    profitPerTrade,
    numTrades,
    currentTrade,
    currentCapital
  );

  return {
    final: finalAmount,
    history: history,
  };
};

const TradingCompoundCalculator = () => {
  const [startingCapital, setStartingCapital] = useState<number>(100000);
  const [profitPerTrade, setProfitPerTrade] = useState<number>(5);
  const [numTrades, setNumTrades] = useState<number>(50);
  const [data, setData] = useState<
    Array<{ trade: number; capital: number; profit: number }>
  >([]);
  const [finalCapital, setFinalCapital] = useState<number>(0);
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [showTradeDetails, setShowTradeDetails] = useState<boolean>(false);
  const [isProfitEditing, setIsProfitEditing] = useState<boolean>(false);
  const [isTradesEditing, setIsTradesEditing] = useState<boolean>(false);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);

  // Animation states
  const [animateChart, setAnimateChart] = useState<boolean>(false);

  // Refs for click-outside detection
  const profitInputRef = useRef<HTMLInputElement>(null);
  const tradesInputRef = useRef<HTMLInputElement>(null);

  // Animation for toast
  const fadeInOutAnimation = `
    @keyframes fadeInOut {
      0%, 100% { opacity: 0; }
      10%, 90% { opacity: 1; }
    }
    .animate-fade-in-out {
      animation: fadeInOut 3s;
    }
  `;

  // Parse URL parameters on initial load
  useEffect(() => {
    // Check if running in browser environment
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);

      // Get values from URL if they exist
      const capitalParam = urlParams.get("capital");
      const profitParam = urlParams.get("profit");
      const tradesParam = urlParams.get("trades");

      // Update state with URL parameters if valid
      if (capitalParam) {
        const capitalValue = parseFloat(capitalParam);
        if (!isNaN(capitalValue) && capitalValue > 0) {
          setStartingCapital(capitalValue);
        }
      }

      if (profitParam) {
        const profitValue = parseFloat(profitParam);
        if (!isNaN(profitValue) && profitValue >= 0.1 && profitValue <= 1000) {
          setProfitPerTrade(profitValue);
        }
      }

      if (tradesParam) {
        const tradesValue = parseInt(tradesParam);
        if (!isNaN(tradesValue) && tradesValue >= 1 && tradesValue <= 10000) {
          setNumTrades(tradesValue);
        }
      }
    }
  }, []);

  // Click outside handler for editable fields
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Check profit input
      if (
        isProfitEditing &&
        profitInputRef.current &&
        !profitInputRef.current.contains(e.target as Node)
      ) {
        setIsProfitEditing(false);
      }

      // Check trades input
      if (
        isTradesEditing &&
        tradesInputRef.current &&
        !tradesInputRef.current.contains(e.target as Node)
      ) {
        setIsTradesEditing(false);
      }
    };

    // Add the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfitEditing, isTradesEditing]);

  // Function to update results when inputs change
  const updateResults = () => {
    setAnimateChart(false);

    // Small delay to allow for smooth animation reset
    setTimeout(() => {
      const result = compoundTradesCalculator(
        startingCapital,
        profitPerTrade,
        numTrades
      );
      setData([
        { trade: 0, capital: startingCapital, profit: 0 },
        ...result.history,
      ]);
      setFinalCapital(result.final);
      setTotalProfit(result.final - startingCapital);
      setIsCalculated(true);
    }, 100);
  };

  // Handle share button click
  const handleShare = () => {
    if (typeof window !== "undefined") {
      // Get current URL without search params
      const currentUrl = window.location.href.split("?")[0];

      // Create URL with parameters
      const params = new URLSearchParams();

      // Add parameters
      params.set("capital", startingCapital.toString());
      params.set("profit", profitPerTrade.toString());
      params.set("trades", numTrades.toString());

      // Create full URL with parameters
      const shareUrl = `${currentUrl}?${params.toString()}`;

      // Copy to clipboard
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          // Show toast
          setShowShareToast(true);

          // Hide toast after 3 seconds
          setTimeout(() => {
            setShowShareToast(false);
          }, 3000);
        })
        .catch((err) => {
          console.error("Failed to copy URL: ", err);
        });
    }
  };

  // Initial calculation on component mount
  useEffect(() => {
    updateResults();
  }, []);

  // Update results whenever inputs change
  useEffect(() => {
    updateResults();
  }, [startingCapital, profitPerTrade, numTrades]);

  // Control chart animation
  useEffect(() => {
    if (isCalculated) {
      setTimeout(() => {
        setAnimateChart(true);
      }, 300);
    }
  }, [isCalculated]);

  const formatCurrency = (value: number) => {
    // If the value has no decimal part, don't show decimal places
    if (value === Math.floor(value)) {
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }

    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6 relative">
      {/* Add style for animation */}
      <style>{fadeInOutAnimation}</style>

      {showShareToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out">
          Link copied to clipboard!
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg overflow-hidden pb-10">
          <div className="w-full bg-emerald-500 p-4 text-white">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">
                Trading Compound Calculator
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:bg-white/20 bg-transparent flex items-center gap-2"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <CardDescription className="text-emerald-100 hidden md:block">
                  Visualize how your capital compounds across multiple trades
                </CardDescription>
              </div>
            </div>
          </div>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Starting Capital ($)
                </label>
                <Input
                  type="text"
                  value={startingCapital.toLocaleString()}
                  onChange={(e) => {
                    // Remove commas and convert to number
                    const numericValue = parseFloat(
                      e.target.value.replace(/,/g, "")
                    );
                    if (!isNaN(numericValue)) {
                      setStartingCapital(numericValue);
                    }
                  }}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Profit Per Trade (%)
                </label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[profitPerTrade]}
                    min={0.1}
                    max={10}
                    step={0.1}
                    onValueChange={(value) => setProfitPerTrade(value[0])}
                    className="flex-1"
                  />
                  {isProfitEditing ? (
                    <Input
                      ref={profitInputRef}
                      type="number"
                      value={profitPerTrade}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 0.1 && value <= 10) {
                          setProfitPerTrade(value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setIsProfitEditing(false);
                        }
                      }}
                      className="w-16 text-right"
                      min={0.1}
                      max={10}
                      step={0.1}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="w-12 text-right cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => setIsProfitEditing(true)}
                    >
                      {profitPerTrade.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Trades</label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[numTrades]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={(value) => setNumTrades(value[0])}
                    className="flex-1"
                  />
                  {isTradesEditing ? (
                    <Input
                      ref={tradesInputRef}
                      type="number"
                      value={numTrades}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 1 && value <= 100) {
                          setNumTrades(value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setIsTradesEditing(false);
                        }
                      }}
                      className="w-12 text-right"
                      min={1}
                      max={100}
                      step={1}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="w-12 text-right cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => setIsTradesEditing(true)}
                    >
                      {numTrades}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {isCalculated && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-lg overflow-hidden">
              <div className="w-full bg-blue-500 p-4 text-white">
                <CardTitle>Capital Growth Visualization</CardTitle>
              </div>

              <CardContent className="p-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data}
                      margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="trade"
                        label={{
                          value: "Number of Trades",
                          position: "insideBottom",
                          offset: 0,
                          dy: 15,
                        }}
                        padding={{ left: 10, right: 10 }}
                      />
                      <YAxis
                        tickFormatter={(value) => {
                          if (value >= 1000000) {
                            return `$${(value / 1000000).toFixed(1)}M`;
                          } else {
                            return `$${(value / 1000).toFixed(0)}k`;
                          }
                        }}
                        label={{
                          value: "Capital ($)",
                          angle: -90,
                          position: "insideLeft",
                          dx: -15,
                        }}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `$${formatCurrency(Number(value))}`,
                          "Capital",
                        ]}
                        labelFormatter={(value) => `Trade ${value}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="capital"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, stroke: "#6366f1", strokeWidth: 2 }}
                        isAnimationActive={animateChart}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="shadow-lg">
              <div className="w-full bg-emerald-500 p-4 text-white flex flex-row items-center justify-between">
                <CardTitle>Trades Details</CardTitle>
                <Button
                  variant="outline"
                  className="text-white border-white hover:bg-white/20 bg-transparent"
                  onClick={() => setShowTradeDetails(!showTradeDetails)}
                >
                  {showTradeDetails ? "Hide Details" : "Show Details"}
                </Button>
              </div>

              {showTradeDetails && (
                <CardContent className="p-6">
                  <div className="overflow-auto max-h-96">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="p-2 text-left border">Trade</th>
                          <th className="p-2 text-right border">
                            Starting Capital
                          </th>
                          <th className="p-2 text-right border">Profit</th>
                          <th className="p-2 text-right border">
                            Ending Capital
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 border">0</td>
                          <td className="p-2 text-right border">
                            ${formatCurrency(startingCapital)}
                          </td>
                          <td className="p-2 text-right border text-green-600">
                            $0.00
                          </td>
                          <td className="p-2 text-right border">
                            ${formatCurrency(startingCapital)}
                          </td>
                        </tr>
                        {data.slice(1).map((item, index) => (
                          <tr
                            key={index}
                            className={index % 2 === 0 ? "bg-gray-50" : ""}
                          >
                            <td className="p-2 border">{item.trade}</td>
                            <td className="p-2 text-right border">
                              $
                              {formatCurrency(
                                index === 0
                                  ? startingCapital
                                  : data[index].capital
                              )}
                            </td>
                            <td className="p-2 text-right border text-green-600">
                              ${formatCurrency(item.profit)}
                            </td>
                            <td className="p-2 text-right border">
                              ${formatCurrency(item.capital)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="shadow-lg">
              <div className="w-full bg-amber-500 p-4 text-white">
                <CardTitle>Trading Summary</CardTitle>
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Starting Capital:</span>
                  <span className="text-xl">
                    ${formatCurrency(startingCapital)}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Profit Per Trade:</span>
                  <span className="text-xl">{profitPerTrade.toFixed(1)}%</span>
                </div>

                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Number of Trades:</span>
                  <span className="text-xl">{numTrades}</span>
                </div>

                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Final Capital:</span>
                  <span className="text-xl text-green-600 font-bold">
                    ${formatCurrency(finalCapital)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Profit:</span>
                  <span className="text-xl text-green-600 font-bold">
                    ${formatCurrency(totalProfit)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <div className="w-full bg-indigo-500 p-4 text-white">
                <CardTitle>Performance Analysis</CardTitle>
              </div>

              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-center h-auto md:h-32 mb-4">
                  <div className="flex flex-col md:flex-row items-center flex-wrap md:space-x-4 w-full">
                    <div className="text-center w-full md:w-auto mb-4 md:mb-0">
                      <div className="text-2xl md:text-4xl font-bold text-indigo-600 break-words">
                        ${formatCurrency(startingCapital)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Starting Capital
                      </div>
                    </div>

                    <div className="text-2xl md:text-3xl text-gray-300 hidden md:block">
                      +
                    </div>
                    <div className="text-2xl md:text-3xl text-gray-300 md:hidden my-1">
                      +
                    </div>

                    <div className="text-center w-full md:w-auto mb-4 md:mb-0">
                      <motion.div
                        className="text-2xl md:text-4xl font-bold text-green-600 break-words"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1, type: "spring" }}
                      >
                        ${formatCurrency(totalProfit)}
                      </motion.div>
                      <div className="text-sm text-gray-500">Total Profit</div>
                    </div>

                    <div className="text-2xl md:text-3xl text-gray-300 hidden md:block">
                      =
                    </div>
                    <div className="text-2xl md:text-3xl text-gray-300 md:hidden my-1">
                      =
                    </div>

                    <div className="text-center w-full md:w-auto">
                      <motion.div
                        className="text-2xl md:text-4xl font-bold text-blue-600 break-words"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.8,
                          delay: 1.5,
                          type: "spring",
                        }}
                      >
                        ${formatCurrency(finalCapital)}
                      </motion.div>
                      <div className="text-sm text-gray-500">Final Capital</div>
                    </div>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200 md:mt-10">
                  <AlertTitle>Performance Metrics</AlertTitle>
                  <AlertDescription>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium">Total Return:</p>
                        <p className="text-lg text-green-600">
                          {((finalCapital / startingCapital - 1) * 100).toFixed(
                            2
                          )}
                          %
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Average Per Trade:
                        </p>
                        <p className="text-lg text-green-600">
                          {profitPerTrade.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default TradingCompoundCalculator;
