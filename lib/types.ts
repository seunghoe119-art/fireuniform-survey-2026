export type Product = { id: string; name: string; price: number };

export type SurveyMember = {
  name: string;
  group: "existing" | "new";
  totalAmount: number;
  purchased: string[];
  needs: string[];
};

