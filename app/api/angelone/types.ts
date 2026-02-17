type AngelApiWrapper<T> = { status: true; message: string; errorcode: ''; data: T } | { status: false; message: string; errorcode: string; data: null };

export type LoginResponse = AngelApiWrapper<{ jwtToken: string; refreshToken: string; feedToken: string; state: unknown; }>;

export type ProfileResponse = AngelApiWrapper<{ clientcode: string; name: string; email: string; mobileno: string; exchanges: string[]; products: string[]; lastlogintime: string; broker: string; }>;