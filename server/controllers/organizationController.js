import Organization from "../models/Organization.js";

export const createOrganization = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Organization name is required",
      });
    }

      const existingOrganization = await Organization.findOne({
        name,
        owner: req.user.id,
      });

      if (existingOrganization) {
        return res.status(409).json({
          success: false,
          message: "Organization with this name already exists",
        });
      }

    // Create Organization
    const organization = await Organization.create({
      name,
      description,
      owner: req.user.id,
      members: [
        {
          user: req.user.id,
          role: "admin",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      organization,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({
      "members.user": req.user.id,
    })
      .populate("owner", "name email")
      .populate("members.user", "name email role");

    res.status(200).json({
      success: true,
      count: organizations.length,
      organizations,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Find organization
    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Only owner can update
    if (organization.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this organization",
      });
    }

    // Update fields
    if (name) organization.name = name;
    if (description) organization.description = description;

    await organization.save();

    res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      organization,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    // Find organization
    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Only owner can delete
    if (organization.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this organization",
      });
    }

    await Organization.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Organization deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

import User from "../models/User.js";

export const inviteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    // Find organization
    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Only owner can invite
    if (organization.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check duplicate member
    const alreadyMember = organization.members.find(
      (member) => member.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({
        success: false,
        message: "User is already a member",
      });
    }

    organization.members.push({
      user: user._id,
      role: role || "developer",
    });

    await organization.save();

    res.status(200).json({
      success: true,
      message: "Member invited successfully",
      organization,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId, role } = req.body;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Only owner can update roles
    if (organization.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    const member = organization.members.find(
      (member) => member.user.toString() === memberId
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    member.role = role;

    await organization.save();

    res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      organization,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    // Find Organization
    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Only owner can remove members
    if (organization.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    // Find Member
    const member = organization.members.find(
      (member) => member.user.toString() === memberId
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // Owner cannot remove themselves
    if (organization.owner.toString() === memberId) {
      return res.status(400).json({
        success: false,
        message: "Owner cannot be removed",
      });
    }

    // Remove Member
    organization.members = organization.members.filter(
      (member) => member.user.toString() !== memberId
    );

    await organization.save();

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      organization,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};