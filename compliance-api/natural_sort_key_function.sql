-- PostgreSQL function for natural sorting
-- This function converts alphanumeric strings into a format that sorts naturally
-- e.g., "2" comes before "10", "Section 2.9" comes before "Section 2.10"

CREATE OR REPLACE FUNCTION natural_sort_key(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    i INTEGER := 1;
    current_char CHAR(1);
    number_buffer TEXT := '';
    in_number BOOLEAN := FALSE;
BEGIN
    -- Handle NULL or empty input - put them at the end for both ASC and DESC
    IF input_text IS NULL OR input_text = '' THEN
        RETURN '~~~~~';  -- Use tildes to ensure empty values sort last
    END IF;
    
    -- Process each character in the input string
    WHILE i <= LENGTH(input_text) LOOP
        current_char := SUBSTRING(input_text FROM i FOR 1);
        
        -- Check if current character is a digit
        IF current_char ~ '[0-9]' THEN
            -- We're in a number
            number_buffer := number_buffer || current_char;
            in_number := TRUE;
        ELSE
            -- We hit a non-digit
            IF in_number THEN
                -- We were in a number, now we need to pad it
                -- Pad numbers to 10 digits with leading zeros for proper sorting
                result := result || LPAD(number_buffer, 10, '0');
                number_buffer := '';
                in_number := FALSE;
            END IF;
            -- Add the non-digit character as-is
            result := result || current_char;
        END IF;
        
        i := i + 1;
    END LOOP;
    
    -- Handle case where string ends with a number
    IF in_number THEN
        result := result || LPAD(number_buffer, 10, '0');
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Example usage:
-- SELECT * FROM table ORDER BY natural_sort_key(column_name);
-- 
-- This will sort:
-- "1", "2", "10", "20" correctly (not "1", "10", "2", "20")
-- "Section 1.1", "Section 1.2", "Section 1.10" correctly
