import React from "react";
import { EditableText } from "../editable/EditableText";
import { Button } from "@/components/ui/button";

interface ContactSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    email?: string;
    phone?: string;
    location?: string;
    address?: string; // Added to support the ContactEditor address field
    message?: string;
    socialLinks?: Record<string, string>;
    variant?: "simple" | "form" | "card" | "split";
    formType?: "simple" | "full" | "split"; // Added to support ContactEditor formType
    showSocialLinks?: boolean;
    showContactForm?: boolean; // Added to support ContactEditor showContactForm
    ctaText?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  template: any;
  editable?: boolean;
  onUpdate?: (newData: any) => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  data,
  template,
  editable = false,
  onUpdate,
}) => {
  // Determine variant based on template category or specified variant
  const variant =
    data.variant ||
    (template.category === "photographer"
      ? "card"
      : template.category === "designer"
        ? "split"
        : "simple");

  // Social media platform icons/names
  const socialPlatforms: Record<string, { name: string; icon: string }> = {
    linkedin: { name: "LinkedIn", icon: "linkedin" },
    github: { name: "GitHub", icon: "github" },
    twitter: { name: "Twitter", icon: "twitter" },
    instagram: { name: "Instagram", icon: "instagram" },
    facebook: { name: "Facebook", icon: "facebook" },
    dribbble: { name: "Dribbble", icon: "dribbble" },
    behance: { name: "Behance", icon: "behance" },
    youtube: { name: "YouTube", icon: "youtube" },
    medium: { name: "Medium", icon: "medium" },
  };

  // Normalize data for backward compatibility
  const normalizedData = {
    ...data,
    // Use address as location if location is not provided
    location: data.location || data.address || "",
    // Handle social links format compatibility - ensure it's an object
    socialLinks: data.socialLinks || {},
    // Set showSocialLinks to true if there are socialLinks and it's not explicitly false
    showSocialLinks:
      data.showSocialLinks !== false &&
      Object.keys(data.socialLinks || {}).length > 0,
    // Set a default form type if not specified
    formType: data.formType || (data.showContactForm ? "simple" : undefined),
  };

  // Handle text updates
  const handleTextUpdate = (field: string, value: string) => {
    if (onUpdate && editable) {
      // Special case handling for location/address
      if (field === "location") {
        onUpdate({
          ...data,
          location: value,
          address: value, // Keep both in sync
        });
        return;
      }

      onUpdate({
        ...data,
        [field]: value,
      });
    }
  };

  // Handle social link update
  const handleSocialLinkUpdate = (platform: string, value: string) => {
    if (onUpdate && editable) {
      const newSocialLinks = { ...(data.socialLinks || {}) };

      if (value === "") {
        delete newSocialLinks[platform];
      } else {
        newSocialLinks[platform] = value;
      }

      onUpdate({
        ...data,
        socialLinks: newSocialLinks,
      });
    }
  };

  // Handle adding a new social link
  const handleAddSocialLink = () => {
    if (onUpdate && editable) {
      const existingPlatforms = Object.keys(data.socialLinks || {});
      const availablePlatforms = Object.keys(socialPlatforms).filter(
        (p) => !existingPlatforms.includes(p)
      );

      if (availablePlatforms.length > 0) {
        const newPlatform = availablePlatforms[0];
        const newSocialLinks = {
          ...(data.socialLinks || {}),
          [newPlatform]: "",
        };

        onUpdate({
          ...data,
          socialLinks: newSocialLinks,
        });
      }
    }
  };

  // Render social links
  const renderSocialLinks = () => {
    if (!normalizedData.showSocialLinks) return null;

    const socialLinks = normalizedData.socialLinks || {};
    if (Object.keys(socialLinks).length === 0) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Connect</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(socialLinks).map(([platform, url]) => (
            <div key={platform} className="relative group">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-full hover:bg-muted/50 transition-colors"
              >
                {socialPlatforms[platform]?.name || platform}
              </a>
              {editable && (
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center shadow-sm hover:bg-red-50"
                    onClick={() => handleSocialLinkUpdate(platform, "")}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
          {editable && (
            <button
              className="inline-flex items-center gap-2 px-4 py-2 border border-dashed rounded-full hover:bg-muted/20 text-muted-foreground"
              onClick={handleAddSocialLink}
            >
              + Add Platform
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render contact info for simple and card variants
  const renderContactInfo = () => {
    return (
      <div className="space-y-4">
        {normalizedData.email && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">
              ✉
            </div>
            <div>
              <div className="font-medium">Email</div>
              <EditableText
                value={normalizedData.email}
                onChange={(value) => handleTextUpdate("email", value)}
                editable={editable}
                className="text-muted-foreground"
              />
            </div>
          </div>
        )}

        {normalizedData.phone && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">
              ☎
            </div>
            <div>
              <div className="font-medium">Phone</div>
              <EditableText
                value={normalizedData.phone}
                onChange={(value) => handleTextUpdate("phone", value)}
                editable={editable}
                className="text-muted-foreground"
              />
            </div>
          </div>
        )}

        {normalizedData.location && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">
              📍
            </div>
            <div>
              <div className="font-medium">Location</div>
              <EditableText
                value={normalizedData.location}
                onChange={(value) => handleTextUpdate("location", value)}
                editable={editable}
                className="text-muted-foreground"
              />
            </div>
          </div>
        )}

        {editable &&
          (!normalizedData.email ||
            !normalizedData.phone ||
            !normalizedData.location) && (
            <div className="mt-4">
              {!normalizedData.email && (
                <button
                  className="block text-primary hover:underline mb-2"
                  onClick={() =>
                    handleTextUpdate("email", "your.email@example.com")
                  }
                >
                  + Add Email
                </button>
              )}
              {!normalizedData.phone && (
                <button
                  className="block text-primary hover:underline mb-2"
                  onClick={() => handleTextUpdate("phone", "+1 (555) 123-4567")}
                >
                  + Add Phone
                </button>
              )}
              {!normalizedData.location && (
                <button
                  className="block text-primary hover:underline"
                  onClick={() => handleTextUpdate("location", "City, Country")}
                >
                  + Add Location
                </button>
              )}
            </div>
          )}
      </div>
    );
  };

  // Render contact form (note: in a real app this would need a backend)
  const renderContactForm = () => {
    // Skip rendering if showContactForm is explicitly false
    if (normalizedData.showContactForm === false) return null;

    // Use the formType from normalized data
    const formType = normalizedData.formType || "simple";

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md bg-muted/10"
            placeholder="Your name"
            disabled={!editable}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded-md bg-muted/10"
            placeholder="Your email"
            disabled={!editable}
          />
        </div>
        {formType !== "simple" && (
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              className="w-full p-2 border rounded-md bg-muted/10 h-32 resize-none"
              placeholder="Your message"
              disabled={!editable}
            />
          </div>
        )}
        <Button className="w-full md:w-auto">
          <EditableText
            value={normalizedData.ctaText || "Send Message"}
            onChange={(value) => handleTextUpdate("ctaText", value)}
            editable={editable}
            className="text-white"
          />
        </Button>

        {editable && (
          <div className="text-sm text-muted-foreground mt-2">
            <p>
              Note: This form is for display purposes. To make it functional,
              you'll need to connect it to a backend service.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render simple contact section
  const renderSimpleLayout = () => {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <EditableText
            value={normalizedData.title || "Get in Touch"}
            onChange={(value) => handleTextUpdate("title", value)}
            editable={editable}
            className="text-3xl font-bold mb-4"
          />

          {normalizedData.subtitle && (
            <EditableText
              value={normalizedData.subtitle}
              onChange={(value) => handleTextUpdate("subtitle", value)}
              editable={editable}
              className="text-xl text-muted-foreground"
            />
          )}
        </div>

        <div className="mb-6">
          <EditableText
            value={
              normalizedData.message ||
              "I'm always open to discussing new projects, opportunities or partnerships."
            }
            onChange={(value) => handleTextUpdate("message", value)}
            editable={editable}
            multiline
            className="text-muted-foreground"
          />
        </div>

        {renderContactInfo()}
        {renderSocialLinks()}
      </div>
    );
  };

  // Render form variant
  const renderFormLayout = () => {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <EditableText
            value={normalizedData.title || "Get in Touch"}
            onChange={(value) => handleTextUpdate("title", value)}
            editable={editable}
            className="text-3xl font-bold mb-4"
          />

          {normalizedData.subtitle && (
            <EditableText
              value={normalizedData.subtitle}
              onChange={(value) => handleTextUpdate("subtitle", value)}
              editable={editable}
              className="text-xl text-muted-foreground"
            />
          )}
        </div>

        <div className="mb-8">
          <EditableText
            value={
              normalizedData.message ||
              "Have a question or want to work together? Fill out the form below and I'll get back to you as soon as possible."
            }
            onChange={(value) => handleTextUpdate("message", value)}
            editable={editable}
            multiline
            className="text-muted-foreground text-center"
          />
        </div>

        {renderContactForm()}
        {renderSocialLinks()}
      </div>
    );
  };

  // Render card variant
  const renderCardLayout = () => {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <EditableText
            value={normalizedData.title || "Get in Touch"}
            onChange={(value) => handleTextUpdate("title", value)}
            editable={editable}
            className="text-3xl font-bold mb-4"
          />

          {normalizedData.subtitle && (
            <EditableText
              value={normalizedData.subtitle}
              onChange={(value) => handleTextUpdate("subtitle", value)}
              editable={editable}
              className="text-xl text-muted-foreground"
            />
          )}
        </div>

        <div className="bg-muted/10 rounded-lg shadow-sm p-8 border">
          <div className="mb-6">
            <EditableText
              value={
                normalizedData.message ||
                "I'd love to hear from you! Whether you have a question about my work, want to hire me, or just want to say hello, I'll try my best to get back to you!"
              }
              onChange={(value) => handleTextUpdate("message", value)}
              editable={editable}
              multiline
              className="text-muted-foreground"
            />
          </div>

          {renderContactInfo()}
          {renderSocialLinks()}
        </div>
      </div>
    );
  };

  // Render split variant (info + form)
  const renderSplitLayout = () => {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <EditableText
            value={normalizedData.title || "Get in Touch"}
            onChange={(value) => handleTextUpdate("title", value)}
            editable={editable}
            className="text-3xl font-bold mb-4"
          />

          {normalizedData.subtitle && (
            <EditableText
              value={normalizedData.subtitle}
              onChange={(value) => handleTextUpdate("subtitle", value)}
              editable={editable}
              className="text-xl text-muted-foreground"
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="bg-muted/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>

            <div className="mb-6">
              <EditableText
                value={
                  normalizedData.message ||
                  "Feel free to reach out using the contact information below or send me a message using the form."
                }
                onChange={(value) => handleTextUpdate("message", value)}
                editable={editable}
                multiline
                className="text-muted-foreground"
              />
            </div>

            {renderContactInfo()}
            {renderSocialLinks()}
          </div>

          <div className="bg-muted/5 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Send a Message</h3>
            {renderContactForm()}
          </div>
        </div>
      </div>
    );
  };

  // Render the contact section based on variant
  const renderContact = () => {
    switch (variant) {
      case "form":
        return renderFormLayout();
      case "card":
        return renderCardLayout();
      case "split":
        return renderSplitLayout();
      case "simple":
      default:
        return renderSimpleLayout();
    }
  };

  return (
    <section
      className="py-16 relative w-full"
      style={{
        backgroundColor: normalizedData.backgroundColor,
        color: normalizedData.textColor,
      }}
      id="contact"
    >
      <div className="container px-4 md:px-6">{renderContact()}</div>

      {/* Edit Controls - Only shown in edit mode */}
      {editable && (
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-md shadow-sm border z-10">
          <div className="text-xs font-medium mb-1">Contact Style</div>
          <select
            value={variant}
            onChange={(e) =>
              onUpdate?.({ ...normalizedData, variant: e.target.value })
            }
            className="text-xs p-1 border rounded w-full mb-2"
          >
            <option value="simple">Simple</option>
            <option value="form">Form</option>
            <option value="card">Card</option>
            <option value="split">Split</option>
          </select>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="showSocialLinks"
              checked={normalizedData.showSocialLinks !== false}
              onChange={(e) =>
                onUpdate?.({
                  ...normalizedData,
                  showSocialLinks: e.target.checked,
                })
              }
              className="w-3 h-3"
            />
            <label htmlFor="showSocialLinks" className="text-xs">
              Social Links
            </label>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContactSection;
