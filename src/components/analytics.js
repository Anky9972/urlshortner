import supabase from "@/db/supabase";

export const incrementLinkClicks = async (linkId, treeId) => {
  try {
    // Fetch the current links array from the tree
    const { data: currentData, error: fetchError } = await supabase
      .from("linktrees")
      .select("links")
      .eq("id", treeId) // Use treeId to fetch the correct tree
      .single();

    if (fetchError) {
      console.error("Error fetching links:", fetchError);
      return false;
    }

    // Increment clicks only for the clicked link
    const updatedLinks = currentData.links.map(link => {
      if (link.id === linkId) {
        return { ...link, clicks: (link.clicks || 0) + 1 };
      }
      return link; // Keep other links unchanged
    });

    // Update the links array in the database
    const { error: updateError } = await supabase
      .from("linktrees")
      .update({ links: updatedLinks })
      .eq("id", treeId);

    if (updateError) {
      console.error("Error updating link clicks:", updateError);
      return false;
    }

    return true; // Successfully updated clicks
  } catch (err) {
    console.error("Unexpected error updating link clicks:", err);
    return false;
  }
};

export const incrementTreeViews = async (treeId) => {
  try {
    // Fetch the current views count from the tree
    const { data: currentData, error: fetchError } = await supabase
      .from("linktrees")
      .select("views")
      .eq("id", treeId) // Use treeId to fetch the correct tree
      .single();

    if (fetchError) {
      console.error("Error fetching views:", fetchError);
      return false;
    }

    // Increment views
    const updatedViews = (currentData.views || 0) + 1;

    // Update the views count in the database
    const { error: updateError } = await supabase
      .from("linktrees")
      .update({ views: updatedViews })
      .eq("id", treeId);

    if (updateError) {
      console.error("Error updating views:", updateError);
      return false;
    }

    return true; // Successfully updated views
  } catch (err) {
    console.error("Unexpected error updating views:", err);
    return false;
  }
};


export const trackAndUpdateTreeLinkClick = async (linkUrl,treeId, linkId) => {
  // Track in Google Analytics
  if (window.gtag) {
    window.gtag('event', 'click', {
      event_category: 'Link',
      event_label: linkUrl,
    });
  }

  // Update clicks in Supabase
  return await incrementLinkClicks(linkId, treeId);
};
export const trackLinkClick = (shortUrl) => {
    if (window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'Link',
        event_label: shortUrl,
      });
    }
  };

export const trackViewTree = async(treeId) => {
    if (window.gtag) {
      window.gtag('event', 'view', {
        event_category: 'Link',
        event_label: treeId,
      });
    }
    return await incrementTreeViews(treeId);
  }
  