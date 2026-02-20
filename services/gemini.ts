
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

export const getFinancialInsights = async (transactions: Transaction[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const expenses = transactions.filter(t => t.type === 'Expense');
  const deposits = transactions.filter(t => t.type === 'Deposit');
  const totalWithInvoices = expenses.filter(t => t.invoiceImage).length;
  
  const prompt = `
    Analyze this Petty Cash (العهدة) financial data and provide 4 professional insights in bullet points (Bilingual: English & Arabic).
    
    Summary Data:
    - Total Transactions: ${transactions.length}
    - Total Deposits: ${deposits.reduce((s, t) => s + t.amount, 0)} EGP
    - Total Expenses: ${expenses.reduce((s, t) => s + t.amount, 0)} EGP
    - Digital Archives: ${totalWithInvoices} out of ${expenses.length} expenses have digital receipts attached.
    - Categories: ${JSON.stringify([...new Set(expenses.map(t => t.category))])}
    
    Focus on:
    1. Highest spending categories.
    2. Budget sustainability and burn rate.
    3. Compliance and Audit health (based on receipt availability).
    4. Suggestions for cost optimization.
    
    Provide a professional tone suitable for a financial manager.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Unable to generate financial insights at this time / لا يمكن توليد التحليلات حالياً.";
  }
};
