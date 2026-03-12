const sites = localStorage.getItem("smart-pages-sites");
if (sites) {
  const parsed = JSON.parse(sites);
  console.log("All sites:");
  parsed.forEach(site => {
    console.log(`- ${site.slug} (${site.name}) - biolink enabled: ${site.biolinkConfig?.enabled}`);
  });
} else {
  console.log("No sites found in localStorage");
}
