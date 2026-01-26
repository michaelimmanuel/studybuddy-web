import { ArrowRight, CheckCircle } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-600 to-blue-700">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl mb-6 text-white">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of dental students who are already preparing smarter, not harder.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 group">
              Start Free 7-Day Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-indigo-700 text-white border-2 border-white rounded-lg hover:bg-indigo-800 transition-colors">
              View Pricing
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <div className="text-white mb-1">No credit card required</div>
                <div className="text-sm text-indigo-200">Start your free trial instantly</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <div className="text-white mb-1">Cancel anytime</div>
                <div className="text-sm text-indigo-200">No long-term commitment needed</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <div className="text-white mb-1">Full access to everything</div>
                <div className="text-sm text-indigo-200">All features included in trial</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
