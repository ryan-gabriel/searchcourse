import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase", () => ({
    getAdminUser: vi.fn(),
}));

import { getAdminUser } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";

const mockedGetAdminUser = vi.mocked(getAdminUser);

describe("requireAdmin (admin API authorization guard)", () => {
    beforeEach(() => {
        mockedGetAdminUser.mockReset();
    });

    it("returns null (authorized) for an authenticated admin", async () => {
        mockedGetAdminUser.mockResolvedValue({
            id: "admin-1",
        } as never);
        const result = await requireAdmin();
        expect(result).toBeNull();
    });

    it("returns 401 for an unauthenticated caller", async () => {
        mockedGetAdminUser.mockResolvedValue(null);
        const result = await requireAdmin();
        expect(result).not.toBeNull();
        expect(result?.status).toBe(401);
    });

    it("returns 401 (does not grant access) when getAdminUser throws", async () => {
        mockedGetAdminUser.mockRejectedValue(new Error("supabase error"));
        const result = await requireAdmin();
        expect(result).not.toBeNull();
        expect(result?.status).toBe(401);
    });
});
