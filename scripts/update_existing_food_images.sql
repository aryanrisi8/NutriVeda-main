-- Add images to all existing food items in the database
-- Run this query in Supabase SQL Editor to add images to existing foods
-- New foods searched via Gemini will automatically get images through the API

-- Update existing food items with appropriate image URLs
UPDATE public.foods SET image_url = 
  CASE 
    -- Grains and Cereals
    WHEN name = 'Basmati Rice' THEN 'https://source.unsplash.com/400x400/?basmati-rice-bowl'
    WHEN name = 'Brown Rice' THEN 'https://source.unsplash.com/400x400/?brown-rice-bowl'
    WHEN name = 'Wheat' THEN 'https://source.unsplash.com/400x400/?wheat-grains'
    WHEN name = 'Quinoa' THEN 'https://source.unsplash.com/400x400/?quinoa-bowl'
    
    -- Legumes
    WHEN name = 'Mung Dal' THEN 'https://source.unsplash.com/400x400/?mung-dal-curry'
    WHEN name = 'Toor Dal' THEN 'https://source.unsplash.com/400x400/?toor-dal-curry'
    WHEN name = 'Chickpeas' THEN 'https://source.unsplash.com/400x400/?chickpeas-curry'
    
    -- Vegetables
    WHEN name = 'Cucumber' THEN 'https://source.unsplash.com/400x400/?fresh-cucumber-slices'
    WHEN name = 'Bitter Gourd' THEN 'https://source.unsplash.com/400x400/?bitter-gourd-vegetable'
    WHEN name = 'Spinach' THEN 'https://source.unsplash.com/400x400/?fresh-spinach-leaves'
    WHEN name = 'Carrot' THEN 'https://source.unsplash.com/400x400/?fresh-carrots'
    WHEN name = 'Tomato' THEN 'https://source.unsplash.com/400x400/?fresh-tomatoes'
    
    -- Fruits
    WHEN name = 'Apple' THEN 'https://source.unsplash.com/400x400/?red-apple-fresh'
    WHEN name = 'Banana' THEN 'https://source.unsplash.com/400x400/?ripe-bananas'
    WHEN name = 'Mango' THEN 'https://source.unsplash.com/400x400/?fresh-mango-fruit'
    WHEN name = 'Pomegranate' THEN 'https://source.unsplash.com/400x400/?pomegranate-seeds'
    
    -- Spices and Herbs
    WHEN name = 'Turmeric' THEN 'https://source.unsplash.com/400x400/?turmeric-powder-golden-spice'
    WHEN name = 'Ginger' THEN 'https://source.unsplash.com/400x400/?fresh-ginger-root'
    WHEN name = 'Cumin' THEN 'https://source.unsplash.com/400x400/?cumin-seeds-spice'
    WHEN name = 'Coriander' THEN 'https://source.unsplash.com/400x400/?coriander-seeds-spice'
    
    -- Dairy and Alternatives
    WHEN name = 'Cow Milk' THEN 'https://source.unsplash.com/400x400/?fresh-milk-glass'
    WHEN name = 'Ghee' THEN 'https://source.unsplash.com/400x400/?clarified-butter-ghee'
    WHEN name = 'Yogurt' THEN 'https://source.unsplash.com/400x400/?fresh-yogurt-bowl'
    
    -- Nuts and Seeds
    WHEN name = 'Almonds' THEN 'https://source.unsplash.com/400x400/?soaked-almonds-nuts'
    WHEN name = 'Walnuts' THEN 'https://source.unsplash.com/400x400/?walnut-kernels'
    WHEN name = 'Sesame Seeds' THEN 'https://source.unsplash.com/400x400/?sesame-seeds'
    
    -- Default fallback for any other foods
    ELSE 'https://source.unsplash.com/400x400/?' || LOWER(REPLACE(name, ' ', '-')) || '-food'
  END
WHERE image_url IS NULL;

-- Verify the update
SELECT name, image_url FROM public.foods WHERE image_url IS NOT NULL LIMIT 10;
