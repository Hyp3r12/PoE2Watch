import "./storage/database";
import { getLastSales } from "./storage/salesvault";

const sales = getLastSales(5) as any[];

console.log("=================================");
console.log("        PoE2Watch Last 5");
console.log("=================================");

if (sales.length === 0) {
    console.log("No sales found.");
} else {
    for (const sale of sales) {
        console.log(`${sale.item_name} - ${sale.price_amount} ${sale.price_currency}`);
        console.log(`Sold at: ${sale.sold_at}`);
        console.log("---------------------------------");
    }
}
