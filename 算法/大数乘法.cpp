#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<int> mul(vector<int> A, vector<int> B)
{
    vector<int> res(A.size() + B.size() + 1, 0);

    for (int i = 0; i < A.size(); i++)
    {
        for (int j = 0; j < B.size(); j++)
        {
            res[i + j] += A[i] * B[j];
        }
    }

    for (int i = 0; i + 1 < res.size(); i++)
    {
        res[i + 1] += res[i] / 10;
        res[i] %= 10;
    }
    // 去掉前面的0
    while (res.size() > 1 && res.back() == 0)
        res.pop_back();
    reverse(res.begin(), res.end());
    return res;
}

vector<int> add(vector<int> A, vector<int> B)
{
    vector<int> res(A.size() + B.size() + 1, 0);

    for (int i = 0; i < A.size(); i++)
        res[i] += A[i];
    for (int i = 0; i < B.size(); i++)
        res[i] += B[i];

    for (int i = 0; i + 1 < res.size(); i++)
    {
        res[i + 1] += res[i] / 10;
        res[i] %= 10;
    }
    while (res.size() > 1 && res.back() == 0)
        res.pop_back();
    reverse(res.begin(), res.end());
    return res;
}

int main()
{
    string a, b;
    cin >> a >> b;
    vector<int> A, B;
    // !!!!!!
    for (int i = a.size() - 1; i >= 0; i--)
    {
        A.push_back(a[i] - '0');
    }
    for (int i = b.size() - 1; i >= 0; i--)
    {
        B.push_back(b[i] - '0');
    }
    vector<int> res = mul(A, B);
    for (int i = 0; i < res.size(); i++)
    {
        cout << res[i];
    }
}