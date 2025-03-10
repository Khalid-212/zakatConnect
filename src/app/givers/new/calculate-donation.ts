"use client";

import { useEffect, useState } from "react";

export function useDonationCalculator() {
  const [familyMembers, setFamilyMembers] = useState<number>(1);
  const [productPrice, setProductPrice] = useState<number>(0);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);

  useEffect(() => {
    // Calculate donation amount based on formula: family_members * 2.5 * product_price
    const amount = familyMembers * 2.5 * productPrice;
    setCalculatedAmount(amount);

    // Update the hidden input field
    const amountInput = document.getElementById("amount") as HTMLInputElement;
    if (amountInput) {
      amountInput.value = amount.toString();
    }
  }, [familyMembers, productPrice]);

  return {
    setFamilyMembers,
    setProductPrice,
    calculatedAmount,
  };
}
