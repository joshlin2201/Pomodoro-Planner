"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FAQ_ITEMS } from '../../constants/faq';

export function FAQ() {
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {FAQ_ITEMS.map((faq, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:border-blue-400 transition-colors">
                        <button
                            className="flex justify-between items-center w-full text-left font-medium text-lg"
                            onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        >
                            {faq.q}
                            {expandedFaq === index ? 
                                <ChevronUp className="h-5 w-5 text-blue-500" /> : 
                                <ChevronDown className="h-5 w-5 text-blue-500" />
                            }
                        </button>
                        {expandedFaq === index && (
                            <div className="mt-4 text-gray-600 leading-relaxed whitespace-pre-line">
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
