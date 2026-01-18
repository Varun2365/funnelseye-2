// Test script to verify couch ID extraction from URL patterns
// This can be run in browser console to test the extraction logic

function extractCouchIdFromUrl() {
  try {
    const currentPath = window.location.pathname;
    console.log('Current path for couch ID extraction:', currentPath);
    
    // Pattern: /funnels/n-6950e1b98aad53sswe5-mkjs9244/welcome-page-1768743575476
    // Extract the part after /funnels/ and before the next /
    const funnelUrlPattern = /\/funnels\/([^\/]+)/;
    const match = currentPath.match(funnelUrlPattern);
    
    if (match && match[1]) {
      const couchId = match[1];
      console.log('Extracted couch ID from URL:', couchId);
      return couchId;
    }
    
    console.log('No couch ID found in URL');
    return null;
  } catch (error) {
    console.error('Error extracting couch ID from URL:', error);
    return null;
  }
}

// Test cases
const testUrls = [
  'http://localhost:8080/funnels/n-6950e1b98aad53sswe5-mkjs9244/welcome-page-1768743575476',
  'http://localhost:8080/funnels/test-coach-id-123/some-page',
  'http://localhost:8080/funnels/another-coach-456/another-page',
  'http://localhost:8080/dashboard/portfolio', // Should return null
  '/funnels/n-6950e1b98aad53sswe5-mkjs9244/welcome-page-1768743575476' // Relative path
];

console.log('=== Testing Couch ID Extraction ===');

testUrls.forEach((url, index) => {
  console.log(`\nTest ${index + 1}: ${url}`);
  
  // Mock window.location.pathname for testing
  const mockPath = new URL(url).pathname;
  const funnelUrlPattern = /\/funnels\/([^\/]+)/;
  const match = mockPath.match(funnelUrlPattern);
  
  if (match && match[1]) {
    const couchId = match[1];
    console.log(`✅ Extracted: ${couchId}`);
  } else {
    console.log('❌ No couch ID found');
  }
});

console.log('\n=== Manual Test Instructions ===');
console.log('1. Navigate to a funnel URL like: http://localhost:8080/funnels/n-6950e1b98aad53sswe5-mkjs9244/welcome-page-1768743575476');
console.log('2. Open browser console');
console.log('3. Run: extractCouchIdFromUrl()');
console.log('4. Verify the extracted couch ID matches the one in the URL');
