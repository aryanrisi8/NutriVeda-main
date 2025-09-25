-- Seed the foods table with comprehensive Ayurvedic food database
-- This includes common Indian foods with their nutritional and Ayurvedic properties

INSERT INTO public.foods (name, category, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, rasa, virya, vipaka, vata_effect, pitta_effect, kapha_effect, qualities, best_season, best_time, benefits, contraindications) VALUES

-- Grains and Cereals
('Basmati Rice', 'Grains', 130, 2.7, 28.0, 0.3, 0.4, '{"Sweet"}', 'Cold', 'Sweet', 'Decrease', 'Decrease', 'Increase', '{"Light", "Easy to digest"}', '{"Summer", "Monsoon"}', '{"Morning", "Afternoon"}', '{"Easy digestion", "Cooling", "Calming"}', '{"Diabetes in excess"}'),

('Brown Rice', 'Grains', 111, 2.6, 23.0, 0.9, 1.8, '{"Sweet", "Astringent"}', 'Neutral', 'Sweet', 'Neutral', 'Neutral', 'Neutral', '{"Heavy", "Nutritious"}', '{"Winter", "Spring"}', '{"Afternoon", "Evening"}', '{"High fiber", "Sustained energy", "Heart health"}', '{"Slow digestion for some"}'),

('Wheat', 'Grains', 340, 13.2, 71.2, 2.5, 12.2, '{"Sweet"}', 'Hot', 'Sweet', 'Increase', 'Increase', 'Increase', '{"Heavy", "Nourishing"}', '{"Winter"}', '{"Morning", "Afternoon"}', '{"Strength building", "Nourishing"}', '{"Gluten sensitivity", "Kapha excess"}'),

('Quinoa', 'Grains', 120, 4.4, 22.0, 1.9, 2.8, '{"Sweet", "Astringent"}', 'Hot', 'Pungent', 'Decrease', 'Increase', 'Decrease', '{"Light", "Dry"}', '{"Winter", "Spring"}', '{"Morning", "Afternoon"}', '{"Complete protein", "Gluten-free", "Easy digestion"}', '{"Pitta excess"}'),

-- Legumes
('Mung Dal', 'Legumes', 105, 7.0, 19.0, 0.4, 2.0, '{"Sweet", "Astringent"}', 'Cold', 'Sweet', 'Decrease', 'Decrease', 'Neutral', '{"Light", "Easy to digest"}', '{"All seasons"}', '{"Afternoon", "Evening"}', '{"Easy digestion", "Protein rich", "Detoxifying"}', '{"None commonly known"}'),

('Toor Dal', 'Legumes', 115, 8.2, 17.1, 1.5, 5.0, '{"Sweet", "Astringent"}', 'Hot', 'Pungent', 'Increase', 'Increase', 'Decrease', '{"Heavy", "Heating"}', '{"Winter", "Spring"}', '{"Afternoon"}', '{"High protein", "Iron rich"}', '{"Pitta excess", "Summer heat"}'),

('Chickpeas', 'Legumes', 164, 8.9, 27.4, 2.6, 7.6, '{"Sweet", "Astringent"}', 'Hot', 'Pungent', 'Increase', 'Increase', 'Decrease', '{"Heavy", "Dry"}', '{"Winter"}', '{"Afternoon"}', '{"High protein", "Fiber rich"}', '{"Vata excess", "Gas formation"}'),

-- Vegetables
('Cucumber', 'Vegetables', 16, 0.7, 3.6, 0.1, 0.5, '{"Sweet"}', 'Cold', 'Sweet', 'Decrease', 'Decrease', 'Increase', '{"Light", "Cooling", "Hydrating"}', '{"Summer", "Monsoon"}', '{"Afternoon", "Evening"}', '{"Cooling", "Hydrating", "Low calorie"}', '{"Kapha excess", "Cold constitution"}'),

('Bitter Gourd', 'Vegetables', 17, 1.0, 3.7, 0.2, 2.8, '{"Bitter"}', 'Cold', 'Pungent', 'Increase', 'Decrease', 'Decrease', '{"Light", "Dry", "Bitter"}', '{"Summer", "Monsoon"}', '{"Morning", "Afternoon"}', '{"Blood sugar control", "Liver detox", "Weight management"}', '{"Pregnancy", "Low blood sugar"}'),

('Spinach', 'Vegetables', 23, 2.9, 3.6, 0.4, 2.2, '{"Sweet", "Astringent"}', 'Cold', 'Pungent', 'Neutral', 'Decrease', 'Neutral', '{"Light", "Cooling"}', '{"Winter", "Spring"}', '{"Morning", "Afternoon"}', '{"Iron rich", "Antioxidants", "Eye health"}', '{"Kidney stones", "Oxalate sensitivity"}'),

('Carrot', 'Vegetables', 41, 0.9, 9.6, 0.2, 2.8, '{"Sweet"}', 'Hot', 'Sweet', 'Decrease', 'Neutral', 'Increase', '{"Heavy", "Sweet", "Grounding"}', '{"Winter", "Spring"}', '{"Morning", "Afternoon"}', '{"Eye health", "Beta carotene", "Digestive"}', '{"Diabetes in excess"}'),

('Tomato', 'Vegetables', 18, 0.9, 3.9, 0.2, 1.2, '{"Sweet", "Sour"}', 'Hot', 'Sour', 'Decrease', 'Increase', 'Decrease', '{"Light", "Heating"}', '{"Winter", "Spring"}', '{"Afternoon"}', '{"Lycopene", "Vitamin C", "Heart health"}', '{"Pitta excess", "Acidity", "Arthritis"}'),

-- Fruits
('Apple', 'Fruits', 52, 0.3, 13.8, 0.2, 2.4, '{"Sweet", "Astringent"}', 'Cold', 'Sweet', 'Decrease', 'Decrease', 'Increase', '{"Light", "Cooling"}', '{"Autumn", "Winter"}', '{"Morning", "Afternoon"}', '{"Fiber rich", "Heart health", "Digestive"}', '{"Kapha excess", "Cold constitution"}'),

('Banana', 'Fruits', 89, 1.1, 22.8, 0.3, 2.6, '{"Sweet"}', 'Cold', 'Sweet', 'Decrease', 'Decrease', 'Increase', '{"Heavy", "Sweet", "Nourishing"}', '{"Summer", "Monsoon"}', '{"Morning", "Afternoon"}', '{"Energy boost", "Potassium", "Heart health"}', '{"Kapha excess", "Cold", "Cough"}'),

('Mango', 'Fruits', 60, 0.8, 15.0, 0.4, 1.6, '{"Sweet"}', 'Hot', 'Sweet', 'Decrease', 'Increase', 'Increase', '{"Heavy", "Sweet", "Juicy"}', '{"Summer"}', '{"Morning", "Afternoon"}', '{"Vitamin A", "Antioxidants", "Energy"}', '{"Pitta excess", "Diabetes", "Weight gain"}'),

('Pomegranate', 'Fruits', 83, 1.7, 18.7, 1.2, 4.0, '{"Sweet", "Sour", "Astringent"}', 'Cold', 'Sweet', 'Decrease', 'Decrease', 'Neutral', '{"Light", "Astringent"}', '{"Autumn", "Winter"}', '{"Morning", "Afternoon"}', '{"Antioxidants", "Heart health", "Blood purifying"}', '{"Constipation in excess"}'),

-- Spices and Herbs
('Turmeric', 'Spices', 354, 7.8, 64.9, 9.9, 21.1, '{"Bitter", "Pungent"}', 'Hot', 'Pungent', 'Increase', 'Increase', 'Decrease', '{"Light", "Dry", "Heating"}', '{"Winter", "Monsoon"}', '{"Morning", "Evening"}', '{"Anti-inflammatory", "Immunity", "Liver health"}', '{"Pregnancy", "Blood thinners", "Gallstones"}'),

('Ginger', 'Spices', 80, 1.8, 17.8, 0.8, 2.0, '{"Pungent"}', 'Hot', 'Sweet', 'Decrease', 'Increase', 'Decrease', '{"Light", "Hot", "Penetrating"}', '{"Winter", "Monsoon"}', '{"Morning", "Afternoon"}', '{"Digestion", "Nausea relief", "Circulation"}', '{"Pitta excess", "Ulcers", "High fever"}'),

('Cumin', 'Spices', 375, 17.8, 44.2, 22.3, 10.5, '{"Pungent", "Bitter"}', 'Hot', 'Pungent', 'Increase', 'Increase', 'Decrease', '{"Light", "Hot", "Dry"}', '{"Winter", "Spring"}', '{"Afternoon", "Evening"}', '{"Digestion", "Iron rich", "Metabolism"}', '{"Pitta excess", "Acidity"}'),

('Coriander', 'Spices', 298, 12.4, 54.9, 17.8, 41.9, '{"Sweet", "Pungent"}', 'Cold', 'Sweet', 'Decrease', 'Decrease', 'Neutral', '{"Light", "Cooling"}', '{"Summer", "Monsoon"}', '{"All times"}', '{"Cooling", "Digestive", "Detoxifying"}', '{"None commonly known"}'),

-- Dairy and Alternatives
('Cow Milk', 'Dairy', 42, 3.4, 5.0, 1.0, 0.0, '{"Sweet"}', 'Cold', 'Sweet', 'Decrease', 'Decrease', 'Increase', '{"Heavy", "Cooling", "Nourishing"}', '{"Winter", "Spring"}', '{"Morning", "Evening"}', '{"Calcium", "Protein", "Nourishing"}', '{"Lactose intolerance", "Kapha excess", "Mucus formation"}'),

('Ghee', 'Dairy', 900, 0.0, 0.0, 100.0, 0.0, '{"Sweet"}', 'Hot', 'Sweet', 'Decrease', 'Neutral', 'Increase', '{"Heavy", "Oily", "Nourishing"}', '{"Winter"}', '{"Morning", "Afternoon"}', '{"Brain health", "Digestion", "Immunity"}', '{"High cholesterol", "Obesity", "Kapha excess"}'),

('Yogurt', 'Dairy', 59, 10.0, 3.6, 0.4, 0.0, '{"Sweet", "Sour"}', 'Hot', 'Sour', 'Decrease', 'Increase', 'Increase', '{"Heavy", "Sour", "Heating"}', '{"Winter", "Spring"}', '{"Afternoon"}', '{"Probiotics", "Protein", "Calcium"}', '{"Pitta excess", "Evening consumption", "Kapha excess"}'),

-- Nuts and Seeds
('Almonds', 'Nuts', 579, 21.2, 21.6, 49.9, 12.5, '{"Sweet"}', 'Hot', 'Sweet', 'Decrease', 'Increase', 'Increase', '{"Heavy", "Oily", "Nourishing"}', '{"Winter"}', '{"Morning"}', '{"Brain health", "Protein", "Healthy fats"}', '{"Pitta excess", "Weight gain"}'),

('Walnuts', 'Nuts', 654, 15.2, 13.7, 65.2, 6.7, '{"Sweet", "Astringent"}', 'Hot', 'Sweet', 'Decrease', 'Increase', 'Increase', '{"Heavy", "Oily"}', '{"Winter"}', '{"Morning"}', '{"Brain health", "Omega-3", "Heart health"}', '{"Pitta excess", "Weight gain"}'),

('Sesame Seeds', 'Seeds', 573, 17.7, 23.4, 49.7, 11.8, '{"Sweet", "Bitter"}', 'Hot', 'Sweet', 'Decrease', 'Increase', 'Increase', '{"Heavy", "Oily", "Heating"}', '{"Winter"}', '{"Morning", "Afternoon"}', '{"Calcium", "Healthy fats", "Bone health"}', '{"Pitta excess", "Weight gain"}');
