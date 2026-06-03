import { useState, useEffect } from 'react'; // Import useEffect
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { evaluate, format } from 'mathjs'; // Import evaluate and format from mathjs

type NumberBase = 'DEC' | 'BIN' | 'HEX' | 'OCT';

const Calculator = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [currentBase, setCurrentBase] = useState<NumberBase>('DEC'); // State for current number base

  // Function to convert a number string to the current base
  const convertToBase = (numStr: string, base: NumberBase): string => {
    try {
      if (numStr === '' || numStr === 'Error') return numStr;

      // Attempt to parse the number in base 10 first
      const num = parseFloat(numStr);
      if (isNaN(num)) return 'Invalid Number';

      // Handle integers for binary, hex, octal
      if (base !== 'DEC' && !Number.isInteger(num)) {
         return 'Integer only'; // Indicate that non-integers can't be represented in other bases easily
      }

      switch (base) {
        case 'DEC':
          return num.toString();
        case 'BIN':
          return num.toString(2);
        case 'HEX':
          return num.toString(16).toUpperCase();
        case 'OCT':
          return num.toString(8);
        default:
          return numStr;
      }
    } catch (e) {
      console.error("Conversion error:", e);
      return 'Error';
    }
  };

  // Effect to update the result display when input or base changes
  useEffect(() => {
    if (input === '') {
      setResult('');
      return;
    }
    try {
      // Use mathjs to evaluate the expression
      const calculatedResult = evaluate(input);
      // Format the result and convert to the current base for display
      const formattedResult = format(calculatedResult, { precision: 14 }); // Use mathjs format for better handling
      setResult(convertToBase(formattedResult, currentBase));
    } catch (error) {
      setResult('Error');
    }
  }, [input, currentBase]); // Recalculate when input or base changes

  const handleButtonClick = (value: string) => {
    if (['DEC', 'BIN', 'HEX', 'OCT'].includes(value)) {
      setCurrentBase(value as NumberBase);
    } else if (value === '=') {
       // When '=' is pressed, evaluate the input and set the result in the current base
       try {
         const calculatedResult = evaluate(input);
         const formattedResult = format(calculatedResult, { precision: 14 });
         setResult(convertToBase(formattedResult, currentBase));
         setInput(formattedResult); // Set input to the calculated decimal result for further calculations
       } catch (error) {
         setResult('Error');
         setInput(''); // Clear input on error
       }
    } else if (value === 'C') {
      setInput('');
      setResult('');
    } else if (value === 'DEL') {
      setInput(input.slice(0, -1));
      // Re-evaluate input after deleting a character
      if (input.length > 1) {
         try {
            const calculatedResult = evaluate(input.slice(0, -1));
            const formattedResult = format(calculatedResult, { precision: 14 });
            setResult(convertToBase(formattedResult, currentBase));
         } catch (error) {
            setResult('Error');
         }
      } else {
         setResult('');
      }
    }
    else {
      // Append value to input
      setInput(input + value);
    }
  };

  // Buttons for standard calculator layout
  const standardButtons = [
    'C', 'DEL', '/', '*',
    '7', '8', '9', '-',
    '4', '5', '6', '+',
    '1', '2', '3', '=',
    '0', '.',
  ];

  // Buttons for number base selection
  const baseButtons: NumberBase[] = ['DEC', 'BIN', 'HEX', 'OCT'];

  // Buttons for scientific functions
  const scientificButtons = [
    'sqrt(', 'sin(', 'cos(', 'tan(',
  ];


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Mini Apps</h3>
        <ul className="flex-grow space-y-2">
          <li>
            <Link
              to="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/notes"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Notes
            </Link>
          </li>
           <li>
            <Link
              to="/gallery"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Gallery
            </Link>
          </li>
           <li>
            <Link
              to="/messaging"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Messaging
            </Link>
          </li>
           <li>
            <Link
              to="/calculator"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              Calculator
            </Link>
          </li>
           <li>
            <Link
              to="/todo"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start"
              )}
            >
              To-Do List
            </Link>
          </li>
          {/* Add links for future mini-apps here */}
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto flex justify-center items-start">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {/* Base Selection Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {baseButtons.map((base) => (
                <Button
                  key={base}
                  onClick={() => handleButtonClick(base)}
                  variant={currentBase === base ? 'default' : 'outline'}
                  className="text-sm p-2 h-auto"
                >
                  {base}
                </Button>
              ))}
            </div>

            {/* Display */}
            <div className="text-right text-2xl p-4 h-auto bg-gray-100 rounded-md break-words">
              <div className="text-sm text-gray-600">{input}</div> {/* Show input expression */}
              <div>{result}</div> {/* Show result in current base */}
            </div>

            {/* Scientific Buttons */}
             <div className="grid grid-cols-4 gap-2">
              {scientificButtons.map((btn) => (
                <Button
                  key={btn}
                  onClick={() => handleButtonClick(btn)}
                  className="text-lg p-4 h-auto bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  {btn}
                </Button>
              ))}
            </div>


            {/* Calculator Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {standardButtons.map((btn) => (
                <Button
                  key={btn}
                  onClick={() => handleButtonClick(btn)}
                  className={cn(
                    "text-lg p-4 h-auto",
                    btn === '=' ? 'col-span-2 bg-blue-500 hover:bg-blue-600 text-white' : '',
                    btn === 'C' || btn === 'DEL' ? 'bg-red-500 hover:bg-red-600 text-white' : '',
                    ['/', '*', '-', '+'].includes(btn) ? 'bg-gray-300 hover:bg-gray-400 text-gray-800' : ''
                  )}
                >
                  {btn}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calculator;