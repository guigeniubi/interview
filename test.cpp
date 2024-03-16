#include <iostream>
#include<vector>
#include<algorithm>
using namespace std;

bool boom(vector<int> a){
    for(int i=1;i<a.size()-2;i++){
        if(a[i]>a[i+1]&&a[i]<a[i-1]){
            return false;
        }
        if(a[i]<a[i+1]&&a[i]>a[i-1]){
            return false;
        }
    }
    return true;
}
int main() {
    int n;
    cin>>n;
    vector<int>ans(n,0);
    for(int i=0;i<ans.size();i++){
        ans.push_back(i+1);
    }
    vector<int>res(n,0);
    while(next_permutation(ans.begin(), ans.end())){
        for(int i=0;i<n;i++){
            res.push_back(ans[i]);
            
        }
        if(boom(res)){
               for(int i=0;i<res.size();i++){
                cout<<res[i]<<' ';
        } 
        }
    }
}
// 64 位输出请用 printf("%lld")