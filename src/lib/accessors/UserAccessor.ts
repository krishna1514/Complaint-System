class UserAccessor {
  private normalize = (name: string): string[] => {
    return name.trim().split(/\s+/).filter(Boolean);
  };

  getInitial = (name: string): string => {
    const names = this.normalize(name);
    if (names.length === 0) return "";
    return names[0][0].toUpperCase();
  };

  getShortName = (name: string): string => {
    const names = this.normalize(name);
    if (names.length === 0) return "";

    if (names.length === 1) {
      return names[0][0].toUpperCase();
    }

    return `${names[0][0].toUpperCase()}${names[1][0].toUpperCase()}`;
  };

  getDisplayName = (name: string): string => {
    const names = this.normalize(name);
    if (names.length === 0) return "";

    return names
      .map(n => n[0].toUpperCase() + n.slice(1).toLowerCase())
      .join(" ");
  };
}

export const userAccessor= new UserAccessor();