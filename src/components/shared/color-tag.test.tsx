import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ColorTag } from "@/components/shared/color-tag";

describe("ColorTag", () => {
  it("renders tag label", () => {
    render(<ColorTag label="React" color="green" />);
    expect(screen.getByText("React")).toBeInTheDocument();
  });
});
