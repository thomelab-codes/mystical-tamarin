import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Copy, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState([16]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charset = '';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (includeLowercase) charset += lowercase;
    if (includeUppercase) charset += uppercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (charset === '') {
      toast.error('Please select at least one character type');
      return;
    }

    let newPassword = '';
    const passwordLength = length[0];

    // Ensure at least one of each selected type
    if (includeUppercase) {
      newPassword += uppercase[Math.floor(Math.random() * uppercase.length)];
    }
    if (includeLowercase) {
      newPassword += lowercase[Math.floor(Math.random() * lowercase.length)];
    }
    if (includeNumbers) {
      newPassword += numbers[Math.floor(Math.random() * numbers.length)];
    }
    if (includeSymbols) {
      newPassword += symbols[Math.floor(Math.random() * symbols.length)];
    }

    // Fill the rest randomly
    for (let i = newPassword.length; i < passwordLength; i++) {
      newPassword += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('');

    setPassword(newPassword);
    setCopied(false);
    toast.success('Password generated!');
  };

  const copyToClipboard = async () => {
    if (!password) {
      toast.error('Generate a password first');
      return;
    }

    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success('Password copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy password');
    }
  };

  const getStrength = () => {
    if (!password) return { label: 'None', color: 'bg-gray-300', width: 0 };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (password.length >= 16) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { label: 'Weak', color: 'bg-red-500', width: 25 };
    if (strength <= 4) return { label: 'Fair', color: 'bg-orange-500', width: 50 };
    if (strength <= 6) return { label: 'Good', color: 'bg-yellow-500', width: 75 };
    return { label: 'Strong', color: 'bg-green-500', width: 100 };
  };

  const strength = getStrength();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-2xl">
        <h1 className="text-4xl font-bold mb-6">Password Generator</h1>

        <Card>
          <CardHeader>
            <CardTitle>Generate Secure Passwords</CardTitle>
            <CardDescription>
              Create strong, random passwords with customizable options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Generated Password</Label>
              <div className="flex gap-2">
                <Input
                  value={password}
                  readOnly
                  placeholder="Click generate to create password"
                  className="font-mono text-lg"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyToClipboard}
                  disabled={!password}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {password && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Strength:</span>
                    <span className="font-semibold">{strength.label}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.width}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Password Length: {length[0]}</Label>
                </div>
                <Slider
                  value={length}
                  onValueChange={setLength}
                  min={4}
                  max={64}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label>Character Types</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uppercase"
                      checked={includeUppercase}
                      onCheckedChange={(checked) => setIncludeUppercase(checked as boolean)}
                    />
                    <label
                      htmlFor="uppercase"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Uppercase (A-Z)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lowercase"
                      checked={includeLowercase}
                      onCheckedChange={(checked) => setIncludeLowercase(checked as boolean)}
                    />
                    <label
                      htmlFor="lowercase"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Lowercase (a-z)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="numbers"
                      checked={includeNumbers}
                      onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
                    />
                    <label
                      htmlFor="numbers"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Numbers (0-9)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="symbols"
                      checked={includeSymbols}
                      onCheckedChange={(checked) => setIncludeSymbols(checked as boolean)}
                    />
                    <label
                      htmlFor="symbols"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Symbols (!@#$%^&*)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={generatePassword} className="w-full" size="lg">
              <RefreshCw className="mr-2 h-5 w-5" />
              Generate Password
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Password Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use at least 12 characters for better security</li>
              <li>• Include a mix of uppercase, lowercase, numbers, and symbols</li>
              <li>• Avoid using personal information or common words</li>
              <li>• Use a different password for each account</li>
              <li>• Consider using a password manager to store your passwords</li>
              <li>• Change passwords regularly, especially for important accounts</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
