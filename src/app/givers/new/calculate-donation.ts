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

    // Also update the mosque_id field if it exists
    const mosqueIdInput = document.getElementById(
      "mosque_id",
    ) as HTMLInputElement;
    if (mosqueIdInput && mosqueIdInput.value === "") {
      // Try to get the mosque ID from the select element
      const mosqueSelect = document.querySelector(
        "select[name='mosque_id']",
      ) as HTMLSelectElement;
      if (mosqueSelect && mosqueSelect.value) {
        mosqueIdInput.value = mosqueSelect.value;
      }
    }
  }, [familyMembers, productPrice]);

  return {
    setFamilyMembers,
    setProductPrice,
    calculatedAmount,
  };
}
