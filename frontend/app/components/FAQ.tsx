'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "Do I need to buy ETH to start?",
        answer: "No! We use Smart Wallets for a gas-less onboarding for your first 5 credits."
    },
    {
        question: "What is a 'Blind Hook'?",
        answer: "You see only the first sentence to focus on engagement potential, preventing bias."
    },
    {
        question: "How does the Quota work?",
        answer: "1 credit = 1 Reveal. This ensures you are strategic about your content."
    },
    {
        question: "Can I view my claimed or purchased hooks?",
        answer: "Yes! Access the History feature to review all your claimed and purchased hooks anytime."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-20 px-6 max-w-3xl mx-auto mb-0">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Frequently Asked Questions
                </h2>
                <p className="text-gray-400 text-sm md:text-base">
                    Everything you need to know about HookLab AI
                </p>
            </motion.div>

            {/* Timeline FAQ */}
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-blue-400 to-transparent" />

                {/* FAQ Items */}
                <div className="space-y-8">
                    {faqData.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative pl-16"
                        >
                            {/* Circle Node */}
                            <div className="absolute left-0 top-0 flex items-center justify-center">
                                <motion.div
                                    className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${openIndex === index
                                        ? 'border-blue-400 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                                        : 'border-blue-500/30 bg-black/50 backdrop-blur-sm'
                                        }`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {openIndex === index ? (
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        )}
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* FAQ Content */}
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-blue-400/30 transition-all duration-300">
                                {/* Question Button */}
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full text-left p-6 flex items-center justify-between group"
                                >
                                    <h3 className="text-white font-semibold text-base md:text-lg pr-4 group-hover:text-blue-300 transition-colors">
                                        {faq.question}
                                    </h3>
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 45 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex-shrink-0"
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${openIndex === index
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white/10 text-gray-400 group-hover:bg-white/20'
                                            }`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                    </motion.div>
                                </button>

                                {/* Answer Dropdown */}
                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 pt-0">
                                                <div className="border-t border-white/10 pt-4">
                                                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
