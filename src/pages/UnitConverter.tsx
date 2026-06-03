import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConversionCategory = 'length' | 'weight' | 'temperature' | 'volume' | 'area' | 'speed' | 'time';

interface Unit {
  name: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

const conversions: Record<ConversionCategory, Record<string, Unit>> = {
  length: {
    meter: { name: 'Meter', toBase: (v) => v, fromBase: (v) => v },
    kilometer: { name: 'Kilometer', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    centimeter: { name: 'Centimeter', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    millimeter: { name: 'Millimeter', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    mile: { name: 'Mile', toBase: (v) => v * 1609.34, fromBase: (v) => v / 1609.34 },
    yard: { name: 'Yard', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    foot: { name: 'Foot', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    inch: { name: 'Inch', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
  },
  weight: {
    kilogram: { name: 'Kilogram', toBase: (v) => v, fromBase: (v) => v },
    gram: { name: 'Gram', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    milligram: { name: 'Milligram', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
    pound: { name: 'Pound', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    ounce: { name: 'Ounce', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
    ton: { name: 'Metric Ton', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  },
  temperature: {
    celsius: {
      name: 'Celsius',
      toBase: (v) => v,
      fromBase: (v) => v,
    },
    fahrenheit: {
      name: 'Fahrenheit',
      toBase: (v) => (v - 32) * (5 / 9),
      fromBase: (v) => v * (9 / 5) + 32,
    },
    kelvin: {
      name: 'Kelvin',
      toBase: (v) => v - 273.15,
      fromBase: (v) => v + 273.15,
    },
  },
  volume: {
    liter: { name: 'Liter', toBase: (v) => v, fromBase: (v) => v },
    milliliter: { name: 'Milliliter', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    gallon: { name: 'Gallon (US)', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
    quart: { name: 'Quart', toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
    pint: { name: 'Pint', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
    cup: { name: 'Cup', toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
    fluidOunce: { name: 'Fluid Ounce', toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
  },
  area: {
    squareMeter: { name: 'Square Meter', toBase: (v) => v, fromBase: (v) => v },
    squareKilometer: { name: 'Square Kilometer', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
    squareMile: { name: 'Square Mile', toBase: (v) => v * 2589988, fromBase: (v) => v / 2589988 },
    squareYard: { name: 'Square Yard', toBase: (v) => v * 0.836127, fromBase: (v) => v / 0.836127 },
    squareFoot: { name: 'Square Foot', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
    acre: { name: 'Acre', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
    hectare: { name: 'Hectare', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
  },
  speed: {
    meterPerSecond: { name: 'Meter/Second', toBase: (v) => v, fromBase: (v) => v },
    kilometerPerHour: { name: 'Kilometer/Hour', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
    milePerHour: { name: 'Mile/Hour', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
    knot: { name: 'Knot', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
  },
  time: {
    second: { name: 'Second', toBase: (v) => v, fromBase: (v) => v },
    minute: { name: 'Minute', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
    hour: { name: 'Hour', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
    day: { name: 'Day', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
    week: { name: 'Week', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
    month: { name: 'Month (30 days)', toBase: (v) => v * 2592000, fromBase: (v) => v / 2592000 },
    year: { name: 'Year (365 days)', toBase: (v) => v * 31536000, fromBase: (v) => v / 31536000 },
  },
};

export default function UnitConverter() {
  const [category, setCategory] = useState<ConversionCategory>('length');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('kilometer');
  const [fromValue, setFromValue] = useState('1');
  const [toValue, setToValue] = useState('0.001');

  const convert = (value: string, from: string, to: string, cat: ConversionCategory) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return '';
    }

    const baseValue = conversions[cat][from].toBase(numValue);
    const result = conversions[cat][to].fromBase(baseValue);
    return result.toFixed(6).replace(/\.?0+$/, '');
  };

  const handleFromValueChange = (value: string) => {
    setFromValue(value);
    const result = convert(value, fromUnit, toUnit, category);
    setToValue(result);
  };

  const handleToValueChange = (value: string) => {
    setToValue(value);
    const result = convert(value, toUnit, fromUnit, category);
    setFromValue(result);
  };

  const handleCategoryChange = (newCategory: ConversionCategory) => {
    setCategory(newCategory);
    const units = Object.keys(conversions[newCategory]);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
    setFromValue('1');
    setToValue(convert('1', units[0], units[1] || units[0], newCategory));
  };

  const handleFromUnitChange = (unit: string) => {
    setFromUnit(unit);
    const result = convert(fromValue, unit, toUnit, category);
    setToValue(result);
  };

  const handleToUnitChange = (unit: string) => {
    setToUnit(unit);
    const result = convert(fromValue, fromUnit, unit, category);
    setToValue(result);
  };

  const swapUnits = () => {
    const tempUnit = fromUnit;
    const tempValue = fromValue;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromValue(toValue);
    setToValue(tempValue);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Unit Converter</h1>

        <Card>
          <CardHeader>
            <CardTitle>Convert Between Units</CardTitle>
            <CardDescription>
              Quick and easy unit conversions for everyday use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={category} onValueChange={(v) => handleCategoryChange(v as ConversionCategory)}>
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="length">Length</TabsTrigger>
                <TabsTrigger value="weight">Weight</TabsTrigger>
                <TabsTrigger value="temperature">Temp</TabsTrigger>
                <TabsTrigger value="volume">Volume</TabsTrigger>
                <TabsTrigger value="area">Area</TabsTrigger>
                <TabsTrigger value="speed">Speed</TabsTrigger>
                <TabsTrigger value="time">Time</TabsTrigger>
              </TabsList>

              <div className="mt-6 space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={fromValue}
                        onChange={(e) => handleFromValueChange(e.target.value)}
                        className="flex-1"
                        placeholder="Enter value"
                      />
                      <Select value={fromUnit} onValueChange={handleFromUnitChange}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(conversions[category]).map(([key, unit]) => (
                            <SelectItem key={key} value={key}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button variant="outline" size="icon" onClick={swapUnits}>
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>To</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={toValue}
                        onChange={(e) => handleToValueChange(e.target.value)}
                        className="flex-1"
                        placeholder="Result"
                      />
                      <Select value={toUnit} onValueChange={handleToUnitChange}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(conversions[category]).map(([key, unit]) => (
                            <SelectItem key={key} value={key}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {fromValue && toValue && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-center text-lg">
                      <span className="font-bold">{fromValue}</span>{' '}
                      {conversions[category][fromUnit].name} ={' '}
                      <span className="font-bold">{toValue}</span>{' '}
                      {conversions[category][toUnit].name}
                    </p>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
