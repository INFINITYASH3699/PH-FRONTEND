"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SocialLinksEditor, { SocialLink } from "./SocialLinksEditor";

// Define contact information interface
interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  showContactForm?: boolean;
  socialLinks?: {
    links: SocialLink[];
  };
}

interface ContactEditorProps {
  data: ContactInfo;
  onChange: (content: ContactInfo) => void;
  isLoading?: boolean;
}

export default function ContactEditor({
  data,
  onChange,
  isLoading = false,
}: ContactEditorProps) {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(
    data || {
      email: "",
      phone: "",
      address: "",
      showContactForm: true,
      socialLinks: { links: [] },
    }
  );

  // Handle basic input changes
  const handleInputChange = (
    field: keyof ContactInfo,
    value: string | boolean
  ) => {
    // Batch state updates to reduce layout shifts
    const updatedContactInfo = {
      ...contactInfo,
      [field]: value,
    };

    // Use requestAnimationFrame to ensure UI updates properly
    window.requestAnimationFrame(() => {
      setContactInfo(updatedContactInfo);
      onChange(updatedContactInfo);
    });
  };

  // Handle social links updates
  const handleSocialLinksUpdate = (socialLinksContent: {
    links: SocialLink[];
  }) => {
    const updatedContactInfo = {
      ...contactInfo,
      socialLinks: socialLinksContent,
    };
    setContactInfo(updatedContactInfo);
    onChange(updatedContactInfo);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Contact Information</h3>
        <p className="text-muted-foreground">
          Add your contact details and preferences for how visitors can reach you.
        </p>
      </div>

      {/* Basic Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={contactInfo.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              // Add these properties to prevent layout shifts
              className="focus:z-10 relative"
              onFocus={(e) =>
                e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest" })
              }
            />
            <p className="text-xs text-muted-foreground">
              This email will be displayed on your portfolio and used for the contact form.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number (Optional)</label>
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={contactInfo.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              // Add these properties to prevent layout shifts
              className="focus:z-10 relative"
              onFocus={(e) =>
                e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest" })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location/Address (Optional)</label>
            <Input
              placeholder="City, Country"
              value={contactInfo.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              // Add these properties to prevent layout shifts
              className="focus:z-10 relative"
              onFocus={(e) =>
                e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest" })
              }
            />
            <p className="text-xs text-muted-foreground">
              For privacy reasons, we recommend only including your city and country.
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <Switch
              id="contact-form"
              checked={contactInfo.showContactForm || false}
              onCheckedChange={(checked) =>
                handleInputChange("showContactForm", checked)
              }
            />
            <Label htmlFor="contact-form" className="font-medium">
              Include contact form on portfolio
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            When enabled, visitors can contact you through a form without seeing your email address.
          </p>
        </CardContent>
      </Card>

      {/* Social Links Section */}
      <SocialLinksEditor
        data={contactInfo.socialLinks || { links: [] }}
        onChange={handleSocialLinksUpdate}
        isLoading={isLoading}
      />
    </div>
  );
}
