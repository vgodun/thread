import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';
import User from '@/lib/models/user.model';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('query');

    await connectToDB();

    let users;
    
    if (!query || query.trim() === '') {
      // If query is empty or just whitespace, return all users (limited to 10)
      users = await User.find()
        .select('id username name image')
        .limit(10);
    } else {
      // Search for users whose username or name contains the query (case insensitive)
      users = await User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } }
        ]
      })
      .select('id username name image')
      .limit(5); // Limit to 5 results for better performance
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
