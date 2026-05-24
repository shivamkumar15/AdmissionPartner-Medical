const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove CSV parsers and helpers
content = content.replace(/function parseGovCsvRows[\s\S]*?loadFallbackColleges\(\) \{[\s\S]*?\n\}\n/g, '');

// Simplify CollagePage
const newLoader = `
  useEffect(() => {
    let cancelled = false;

    const loadColleges = async () => {
      setLoading(true);
      setError('');

      try {
        const rows = await fetchColleges();

        if (cancelled) {
          return;
        }

        const mergedColleges = rows
          .map((row, index) => mapCollegeRow(row, 'colleges', index))
          .filter((college): college is CollageCollege => college !== null);

        if (!mergedColleges.length) {
          setError('No colleges were found in Supabase.');
          setColleges([]);
          return;
        }

        setColleges(mergedColleges);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load collage data.');
          setColleges([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadColleges();

    return () => {
      cancelled = true;
    };
  }, []);
`;

content = content.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g, newLoader.trim());

// Remove splitCsvLine, isNumericToken
content = content.replace(/function splitCsvLine[\s\S]*?isNumericToken[\s\S]*?\}\n/g, '');

fs.writeFileSync('src/App.tsx', content);
